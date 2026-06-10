import { and, eq } from "drizzle-orm";
import {
  gameAnnouncementRecipientsTable,
  gameAnnouncementsTable,
  gamesTable,
  usersTable,
} from "@/db/tables";
import type { DBContext } from "@/lib/middleware/db";

type AnnouncementDb = Pick<DBContext, "select">;

export interface AnnouncementContext {
  announcement: {
    id: string;
    gameId: string;
    senderUserId: string;
    title: string;
    body: string;
    requiresAck: boolean;
    createdAt: Date;
  };
  game: {
    id: string;
    hostId: string;
    title: string;
    sport: string;
    locationName: string;
    scheduledAt: Date;
  };
  isHost: boolean;
  isRecipient: boolean;
  recipientRecord: {
    userId: string;
    acknowledgedAt: Date | null;
  } | null;
}

export async function getAnnouncementContext(
  db: AnnouncementDb,
  announcementId: string,
  userId: string,
): Promise<AnnouncementContext | null> {
  const [row] = await db
    .select({
      announcementId: gameAnnouncementsTable.id,
      gameId: gameAnnouncementsTable.gameId,
      senderUserId: gameAnnouncementsTable.senderUserId,
      title: gameAnnouncementsTable.title,
      body: gameAnnouncementsTable.body,
      requiresAck: gameAnnouncementsTable.requiresAck,
      createdAt: gameAnnouncementsTable.createdAt,
      hostId: gamesTable.hostId,
      gameTitle: gamesTable.title,
      sport: gamesTable.sport,
      locationName: gamesTable.locationName,
      scheduledAt: gamesTable.scheduledAt,
    })
    .from(gameAnnouncementsTable)
    .innerJoin(gamesTable, eq(gameAnnouncementsTable.gameId, gamesTable.id))
    .where(eq(gameAnnouncementsTable.id, announcementId))
    .limit(1);

  if (!row) {
    return null;
  }

  const [recipientRecord] = await db
    .select({
      userId: gameAnnouncementRecipientsTable.userId,
      acknowledgedAt: gameAnnouncementRecipientsTable.acknowledgedAt,
    })
    .from(gameAnnouncementRecipientsTable)
    .where(
      and(
        eq(gameAnnouncementRecipientsTable.announcementId, announcementId),
        eq(gameAnnouncementRecipientsTable.userId, userId),
      ),
    )
    .limit(1);

  const isHost = row.hostId === userId;
  const isRecipient = recipientRecord !== undefined && row.senderUserId !== userId;

  return {
    announcement: {
      id: row.announcementId,
      gameId: row.gameId,
      senderUserId: row.senderUserId,
      title: row.title,
      body: row.body,
      requiresAck: row.requiresAck,
      createdAt: row.createdAt,
    },
    game: {
      id: row.gameId,
      hostId: row.hostId,
      title: row.gameTitle,
      sport: row.sport,
      locationName: row.locationName,
      scheduledAt: row.scheduledAt,
    },
    isHost,
    isRecipient,
    recipientRecord: recipientRecord ?? null,
  };
}

export async function getUserName(db: AnnouncementDb, userId: string) {
  const [user] = await db
    .select({ name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  return user?.name ?? "A player";
}

export function buildAnnouncementMetadata(
  announcement: Pick<AnnouncementContext["announcement"], "id" | "title">,
  game: AnnouncementContext["game"],
  extra?: Record<string, string | number | boolean | null>,
) {
  return {
    gameTitle: game.title,
    sport: game.sport,
    locationName: game.locationName,
    scheduledAt: game.scheduledAt.toISOString(),
    announcementId: announcement.id,
    announcementTitle: announcement.title,
    ...extra,
  };
}
