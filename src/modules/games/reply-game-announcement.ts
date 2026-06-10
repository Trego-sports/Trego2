import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { gameAnnouncementMessagesTable } from "@/db/tables";
import { generateId } from "@/lib/id";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { createNotification } from "@/modules/notifications";
import { buildAnnouncementMetadata, getAnnouncementContext, getUserName } from "./announcement-utils";

export const replyGameAnnouncementSchema = z.object({
  announcementId: z.string(),
  body: z.string().trim().min(1, "Reply cannot be empty").max(2000),
  threadParticipantUserId: z.string().optional(),
});

export type ReplyGameAnnouncementInput = z.input<typeof replyGameAnnouncementSchema>;

export const $replyGameAnnouncement = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(replyGameAnnouncementSchema)
  .handler(async ({ context, data }) => {
    await context.db.transaction(async (tx) => {
      const announcementContext = await getAnnouncementContext(tx, data.announcementId, context.userId);

      if (!announcementContext) {
        throw new Error("Announcement not found");
      }

      let threadParticipantUserId: string;
      let recipientUserId: string;

      if (announcementContext.isHost) {
        if (!data.threadParticipantUserId) {
          throw new Error("Select which participant you are replying to.");
        }

        const participantContext = await getAnnouncementContext(tx, data.announcementId, data.threadParticipantUserId);
        if (!participantContext?.isRecipient) {
          throw new Error("You can only reply to announcement recipients.");
        }

        threadParticipantUserId = data.threadParticipantUserId;
        recipientUserId = threadParticipantUserId;
      } else if (announcementContext.isRecipient) {
        threadParticipantUserId = context.userId;
        recipientUserId = announcementContext.game.hostId;
      } else {
        throw new Error("You do not have access to this announcement thread.");
      }

      await tx.insert(gameAnnouncementMessagesTable).values({
        id: generateId("announce_msg"),
        announcementId: data.announcementId,
        senderUserId: context.userId,
        threadParticipantUserId,
        body: data.body,
      });

      const senderName = await getUserName(tx, context.userId);

      await createNotification(tx, {
        recipientUserId,
        actorUserId: context.userId,
        gameId: announcementContext.game.id ?? undefined,
        type: "game_announcement_reply",
        title: announcementContext.isHost
          ? `Reply: ${announcementContext.announcement.title}`
          : `Reply: ${announcementContext.announcement.title}`,
        body: announcementContext.isHost
          ? `The host replied in "${announcementContext.announcement.title}": ${data.body}`
          : `${senderName} replied to "${announcementContext.announcement.title}": ${data.body}`,
        metadata: buildAnnouncementMetadata(announcementContext.announcement, announcementContext.game, {
          threadParticipantUserId,
          senderName,
          requiresAck: announcementContext.announcement.requiresAck,
        }),
      });
    });
  });
