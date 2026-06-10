import { createServerFn } from "@tanstack/react-start";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { gameAnnouncementMessagesTable, usersTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { getAnnouncementContext, getUserName } from "./announcement-utils";

export interface AnnouncementThreadMessage {
  id: string;
  senderUserId: string;
  senderName: string;
  body: string;
  createdAt: Date;
  isMine: boolean;
}

export interface AnnouncementThread {
  announcementId: string;
  gameId: string;
  gameTitle: string;
  announcementTitle: string;
  originalBody: string;
  requiresAck: boolean;
  isHost: boolean;
  canAck: boolean;
  hasAcked: boolean;
  threadParticipantUserId: string;
  threadParticipantName: string;
  messages: AnnouncementThreadMessage[];
}

export const $getAnnouncementThread = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(
    z.object({
      announcementId: z.string(),
      threadParticipantUserId: z.string().optional(),
    }),
  )
  .handler(async ({ context, data }): Promise<AnnouncementThread> => {
    const announcementContext = await getAnnouncementContext(context.db, data.announcementId, context.userId);

    if (!announcementContext) {
      throw new Error("Announcement not found");
    }

    let threadParticipantUserId: string;

    if (announcementContext.isHost) {
      if (!data.threadParticipantUserId) {
        throw new Error("Select which participant thread to view.");
      }

      const participantContext = await getAnnouncementContext(
        context.db,
        data.announcementId,
        data.threadParticipantUserId,
      );

      if (!participantContext?.isRecipient) {
        throw new Error("You can only view threads with announcement recipients.");
      }

      threadParticipantUserId = data.threadParticipantUserId;
    } else if (announcementContext.isRecipient) {
      threadParticipantUserId = context.userId;
    } else {
      throw new Error("You do not have access to this announcement thread.");
    }

    const replyRows = await context.db
      .select({
        id: gameAnnouncementMessagesTable.id,
        senderUserId: gameAnnouncementMessagesTable.senderUserId,
        senderName: usersTable.name,
        body: gameAnnouncementMessagesTable.body,
        createdAt: gameAnnouncementMessagesTable.createdAt,
      })
      .from(gameAnnouncementMessagesTable)
      .innerJoin(usersTable, eq(gameAnnouncementMessagesTable.senderUserId, usersTable.id))
      .where(
        and(
          eq(gameAnnouncementMessagesTable.announcementId, data.announcementId),
          eq(gameAnnouncementMessagesTable.threadParticipantUserId, threadParticipantUserId),
        ),
      )
      .orderBy(asc(gameAnnouncementMessagesTable.createdAt));

    const threadParticipantName = await getUserName(context.db, threadParticipantUserId);

    let hasAcked = false;
    if (announcementContext.isRecipient) {
      hasAcked = Boolean(announcementContext.recipientRecord?.acknowledgedAt);
    } else {
      const participantContext = await getAnnouncementContext(
        context.db,
        data.announcementId,
        threadParticipantUserId,
      );
      hasAcked = Boolean(participantContext?.recipientRecord?.acknowledgedAt);
    }

    return {
      announcementId: announcementContext.announcement.id,
      gameId: announcementContext.game.id,
      gameTitle: announcementContext.game.title,
      announcementTitle: announcementContext.announcement.title,
      originalBody: announcementContext.announcement.body,
      requiresAck: announcementContext.announcement.requiresAck,
      isHost: announcementContext.isHost,
      canAck:
        announcementContext.isRecipient &&
        announcementContext.announcement.requiresAck &&
        !announcementContext.recipientRecord?.acknowledgedAt,
      hasAcked,
      threadParticipantUserId,
      threadParticipantName,
      messages: replyRows.map((message) => ({
        id: message.id,
        senderUserId: message.senderUserId,
        senderName: message.senderName,
        body: message.body,
        createdAt: message.createdAt,
        isMine: message.senderUserId === context.userId,
      })),
    };
  });
