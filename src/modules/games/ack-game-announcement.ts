import { createServerFn } from "@tanstack/react-start";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { gameAnnouncementRecipientsTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { createNotification } from "@/modules/notifications";
import { buildAnnouncementMetadata, getAnnouncementContext, getUserName } from "./announcement-utils";

export const $ackGameAnnouncement = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(z.object({ announcementId: z.string() }))
  .handler(async ({ context, data }) => {
    await context.db.transaction(async (tx) => {
      const announcementContext = await getAnnouncementContext(tx, data.announcementId, context.userId);

      if (!announcementContext) {
        throw new Error("Announcement not found");
      }

      if (announcementContext.isHost) {
        throw new Error("Hosts cannot acknowledge their own announcements.");
      }

      if (!announcementContext.isRecipient) {
        throw new Error("You are not a recipient of this announcement.");
      }

      if (!announcementContext.announcement.requiresAck) {
        throw new Error("This announcement does not require acknowledgment.");
      }

      if (announcementContext.recipientRecord?.acknowledgedAt) {
        return;
      }

      const acknowledgedAt = new Date();

      await tx
        .update(gameAnnouncementRecipientsTable)
        .set({ acknowledgedAt })
        .where(
          and(
            eq(gameAnnouncementRecipientsTable.announcementId, data.announcementId),
            eq(gameAnnouncementRecipientsTable.userId, context.userId),
            isNull(gameAnnouncementRecipientsTable.acknowledgedAt),
          ),
        );

      const participantName = await getUserName(tx, context.userId);

      await createNotification(tx, {
        recipientUserId: announcementContext.game.hostId,
        actorUserId: context.userId,
        gameId: announcementContext.game.id ?? undefined,
        type: "game_announcement_ack",
        title: `Acknowledged: ${announcementContext.announcement.title}`,
        body: `${participantName} acknowledged "${announcementContext.announcement.title}".`,
        metadata: buildAnnouncementMetadata(announcementContext.announcement, announcementContext.game, {
          threadParticipantUserId: context.userId,
          participantName,
          requiresAck: announcementContext.announcement.requiresAck,
        }),
      });
    });
  });
