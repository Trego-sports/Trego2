import { createServerFn } from "@tanstack/react-start";
import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import {
  type GameAnnouncementAudienceType,
  gameAnnouncementMessagesTable,
  gameAnnouncementRecipientsTable,
  gameAnnouncementsTable,
  gamesTable,
  usersTable,
} from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export interface GameAnnouncementRecipient {
  userId: string;
  name: string;
  acknowledgedAt: Date | null;
}

export interface GameAnnouncement {
  id: string;
  gameId: string;
  senderUserId: string;
  senderName: string;
  title: string;
  body: string;
  audienceType: GameAnnouncementAudienceType;
  requiresAck: boolean;
  createdAt: Date;
  recipients: GameAnnouncementRecipient[];
  replyThreadCount: number;
}

export const $getGameAnnouncements = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(z.object({ gameId: z.string() }))
  .handler(async ({ context, data }): Promise<GameAnnouncement[]> => {
    const [game] = await context.db
      .select({ hostId: gamesTable.hostId })
      .from(gamesTable)
      .where(eq(gamesTable.id, data.gameId))
      .limit(1);

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.hostId !== context.userId) {
      throw new Error("Only the game host can view announcement history.");
    }

    const announcements = await context.db
      .select({
        id: gameAnnouncementsTable.id,
        gameId: gameAnnouncementsTable.gameId,
        senderUserId: gameAnnouncementsTable.senderUserId,
        senderName: usersTable.name,
        title: gameAnnouncementsTable.title,
        body: gameAnnouncementsTable.body,
        audienceType: gameAnnouncementsTable.audienceType,
        requiresAck: gameAnnouncementsTable.requiresAck,
        createdAt: gameAnnouncementsTable.createdAt,
      })
      .from(gameAnnouncementsTable)
      .innerJoin(usersTable, eq(gameAnnouncementsTable.senderUserId, usersTable.id))
      .where(eq(gameAnnouncementsTable.gameId, data.gameId))
      .orderBy(desc(gameAnnouncementsTable.createdAt));

    if (announcements.length === 0) {
      return [];
    }

    const announcementIds = announcements.map((announcement) => announcement.id);
    const recipientRows = await context.db
      .select({
        announcementId: gameAnnouncementRecipientsTable.announcementId,
        userId: usersTable.id,
        name: usersTable.name,
        acknowledgedAt: gameAnnouncementRecipientsTable.acknowledgedAt,
      })
      .from(gameAnnouncementRecipientsTable)
      .innerJoin(usersTable, eq(gameAnnouncementRecipientsTable.userId, usersTable.id))
      .where(inArray(gameAnnouncementRecipientsTable.announcementId, announcementIds))
      .orderBy(asc(usersTable.name));

    const threadCounts = await context.db
      .select({
        announcementId: gameAnnouncementMessagesTable.announcementId,
        count: sql<number>`COUNT(DISTINCT ${gameAnnouncementMessagesTable.threadParticipantUserId})::int`,
      })
      .from(gameAnnouncementMessagesTable)
      .where(inArray(gameAnnouncementMessagesTable.announcementId, announcementIds))
      .groupBy(gameAnnouncementMessagesTable.announcementId);

    const recipientsByAnnouncementId = new Map<string, GameAnnouncementRecipient[]>();
    const threadCountByAnnouncementId = new Map(
      threadCounts.map((row) => [row.announcementId, row.count] as const),
    );

    for (const recipient of recipientRows) {
      if (recipient.userId === game.hostId) {
        continue;
      }

      const existingRecipients = recipientsByAnnouncementId.get(recipient.announcementId) ?? [];
      existingRecipients.push({
        userId: recipient.userId,
        name: recipient.name,
        acknowledgedAt: recipient.acknowledgedAt,
      });
      recipientsByAnnouncementId.set(recipient.announcementId, existingRecipients);
    }

    return announcements.map((announcement) => ({
      ...announcement,
      recipients: recipientsByAnnouncementId.get(announcement.id) ?? [],
      replyThreadCount: threadCountByAnnouncementId.get(announcement.id) ?? 0,
    }));
  });
