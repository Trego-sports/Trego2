import { createServerFn } from "@tanstack/react-start";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  type GameAnnouncementAudienceType,
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
}

export interface GameAnnouncement {
  id: string;
  gameId: string;
  senderUserId: string;
  senderName: string;
  body: string;
  audienceType: GameAnnouncementAudienceType;
  createdAt: Date;
  recipients: GameAnnouncementRecipient[];
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
        body: gameAnnouncementsTable.body,
        audienceType: gameAnnouncementsTable.audienceType,
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
      })
      .from(gameAnnouncementRecipientsTable)
      .innerJoin(usersTable, eq(gameAnnouncementRecipientsTable.userId, usersTable.id))
      .where(inArray(gameAnnouncementRecipientsTable.announcementId, announcementIds))
      .orderBy(asc(usersTable.name));

    const recipientsByAnnouncementId = new Map<string, GameAnnouncementRecipient[]>();

    for (const recipient of recipientRows) {
      const existingRecipients = recipientsByAnnouncementId.get(recipient.announcementId) ?? [];
      existingRecipients.push({ userId: recipient.userId, name: recipient.name });
      recipientsByAnnouncementId.set(recipient.announcementId, existingRecipients);
    }

    return announcements.map((announcement) => ({
      ...announcement,
      recipients: recipientsByAnnouncementId.get(announcement.id) ?? [],
    }));
  });
