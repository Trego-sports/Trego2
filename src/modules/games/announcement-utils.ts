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
    gameId: string | null;
    gameTitle: string;
    hostUserId: string;
    senderUserId: string;
    title: string;
    body: string;
    requiresAck: boolean;
    createdAt: Date;
  };
  game: {
    id: string | null;
    hostId: string;
    title: string;
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
      gameTitle: gameAnnouncementsTable.gameTitle,
      hostUserId: gameAnnouncementsTable.hostUserId,
      senderUserId: gameAnnouncementsTable.senderUserId,
      announcementTitle: gameAnnouncementsTable.title,
      body: gameAnnouncementsTable.body,
      requiresAck: gameAnnouncementsTable.requiresAck,
      createdAt: gameAnnouncementsTable.createdAt,
      // Game row may be null if game was deleted
      liveHostId: gamesTable.hostId,
    })
    .from(gameAnnouncementsTable)
    .leftJoin(gamesTable, eq(gameAnnouncementsTable.gameId, gamesTable.id))
    .where(eq(gameAnnouncementsTable.id, announcementId))
    .limit(1);

  if (!row) {
    return null;
  }

  // Fall back to the denormalised host stored at creation time
  const effectiveHostId = row.liveHostId ?? row.hostUserId;

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

  const isHost = effectiveHostId === userId;
  const isRecipient = recipientRecord !== undefined && row.senderUserId !== userId;

  return {
    announcement: {
      id: row.announcementId,
      gameId: row.gameId,
      gameTitle: row.gameTitle,
      hostUserId: row.hostUserId,
      senderUserId: row.senderUserId,
      title: row.announcementTitle,
      body: row.body,
      requiresAck: row.requiresAck,
      createdAt: row.createdAt,
    },
    game: {
      id: row.gameId,
      hostId: effectiveHostId,
      title: row.gameTitle,
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
  announcement: Pick<AnnouncementContext["announcement"], "id" | "title" | "gameId" | "gameTitle">,
  game: AnnouncementContext["game"],
  extra?: Record<string, string | number | boolean | null>,
) {
  return {
    gameTitle: game.title,
    announcementId: announcement.id,
    announcementTitle: announcement.title,
    ...extra,
  };
}
