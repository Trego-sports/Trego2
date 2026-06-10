import { and, eq, isNull, sql } from "drizzle-orm";
import {
  gameAnnouncementRecipientsTable,
  gameAnnouncementsTable,
  gamesTable,
  notificationsTable,
  usersTable,
} from "@/db/tables";
import { generateId } from "@/lib/id";
import type { DBContext } from "@/lib/middleware/db";
import type { CreateNotificationInput } from "@/modules/notifications/types";

type AnnouncementDb = Pick<DBContext, "select">;
type AnnouncementWriteDb = Pick<DBContext, "select" | "insert" | "update">;

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
  isExpired: boolean;
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
      scheduledAt: gamesTable.scheduledAt,
      durationMinutes: gamesTable.durationMinutes,
    })
    .from(gameAnnouncementsTable)
    .leftJoin(gamesTable, eq(gameAnnouncementsTable.gameId, gamesTable.id))
    .where(eq(gameAnnouncementsTable.id, announcementId))
    .limit(1);

  if (!row) {
    return null;
  }

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

  // Expired if: game was deleted (gameId null) OR game has ended
  let isExpired = row.gameId === null;
  if (!isExpired && row.scheduledAt && row.durationMinutes !== null) {
    const gameEndsAt = new Date(row.scheduledAt.getTime() + row.durationMinutes * 60 * 1000);
    isExpired = gameEndsAt < new Date();
  }

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
    isExpired,
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

/**
 * Upserts a notification for an announcement thread.
 * If a live (non-deleted) notification already exists for this
 * (recipient, announcementId, threadParticipantUserId) triple, it is
 * updated in place (and marked unread) so the inbox stays as one entry
 * per thread rather than accumulating a new row per reply.
 */
export async function upsertAnnouncementThreadNotification(
  db: AnnouncementWriteDb,
  input: CreateNotificationInput & {
    announcementId: string;
    threadParticipantUserId: string;
  },
) {
  const [existing] = await db
    .select({ id: notificationsTable.id })
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.recipientUserId, input.recipientUserId),
        isNull(notificationsTable.deletedAt),
        sql`${notificationsTable.metadata}->>'announcementId' = ${input.announcementId}`,
        sql`${notificationsTable.metadata}->>'threadParticipantUserId' = ${input.threadParticipantUserId}`,
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(notificationsTable)
      .set({
        type: input.type,
        title: input.title,
        body: input.body,
        metadata: input.metadata ?? null,
        actorUserId: input.actorUserId ?? null,
        gameId: input.gameId ?? null,
        readAt: null,
        acknowledgedAt: null,
      })
      .where(eq(notificationsTable.id, existing.id));
  } else {
    await db.insert(notificationsTable).values({
      id: generateId("notif"),
      recipientUserId: input.recipientUserId,
      actorUserId: input.actorUserId ?? null,
      gameId: input.gameId ?? null,
      type: input.type,
      title: input.title,
      body: input.body,
      metadata: input.metadata ?? null,
    });
  }
}
