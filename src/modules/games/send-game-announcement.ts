import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  gameAnnouncementRecipientsTable,
  gameAnnouncementsTable,
  gameParticipantsTable,
  gamesTable,
} from "@/db/tables";
import { generateId } from "@/lib/id";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { createNotifications } from "@/modules/notifications";

export const sendGameAnnouncementSchema = z
  .object({
    gameId: z.string(),
    title: z.string().trim().min(1, "Title is required").max(120),
    body: z.string().trim().min(1, "Announcement cannot be empty").max(2000),
    audienceType: z.enum(["all", "selected"]),
    requiresAck: z.boolean().default(false),
    recipientUserIds: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.audienceType === "selected" && (!data.recipientUserIds || data.recipientUserIds.length === 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one participant",
        path: ["recipientUserIds"],
      });
    }
  });

export type SendGameAnnouncementInput = z.input<typeof sendGameAnnouncementSchema>;

export const $sendGameAnnouncement = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(sendGameAnnouncementSchema)
  .handler(async ({ context, data }) => {
    await context.db.transaction(async (tx) => {
      const [game] = await tx
        .select({
          id: gamesTable.id,
          hostId: gamesTable.hostId,
          title: gamesTable.title,
          sport: gamesTable.sport,
          locationName: gamesTable.locationName,
          scheduledAt: gamesTable.scheduledAt,
        })
        .from(gamesTable)
        .where(eq(gamesTable.id, data.gameId))
        .limit(1);

      if (!game) {
        throw new Error("Game not found");
      }

      if (game.hostId !== context.userId) {
        throw new Error("Only the game host can send announcements.");
      }

      const participants = await tx
        .select({ userId: gameParticipantsTable.userId })
        .from(gameParticipantsTable)
        .where(eq(gameParticipantsTable.gameId, data.gameId));

      const participantIds = new Set(participants.map((participant) => participant.userId));

      let storedRecipientUserIds: string[];
      if (data.audienceType === "all") {
        storedRecipientUserIds = participants.map((participant) => participant.userId);
      } else {
        const uniqueRecipientIds = [...new Set(data.recipientUserIds ?? [])];
        if (!uniqueRecipientIds.every((userId) => participantIds.has(userId))) {
          throw new Error("Recipients must be participants of this game.");
        }
        storedRecipientUserIds = uniqueRecipientIds;
      }

      const notificationRecipientUserIds = storedRecipientUserIds.filter((userId) => userId !== context.userId);

      if (notificationRecipientUserIds.length === 0) {
        throw new Error("No recipients available for this announcement.");
      }

      const announcementId = generateId("announce");

      await tx.insert(gameAnnouncementsTable).values({
        id: announcementId,
        gameId: data.gameId,
        senderUserId: context.userId,
        title: data.title,
        body: data.body,
        audienceType: data.audienceType,
        requiresAck: data.requiresAck,
      });

      await tx.insert(gameAnnouncementRecipientsTable).values(
        storedRecipientUserIds.map((userId) => ({
          announcementId,
          userId,
        })),
      );

      await createNotifications(
        tx,
        notificationRecipientUserIds.map((recipientUserId) => ({
          recipientUserId,
          actorUserId: context.userId,
          gameId: data.gameId,
          type: "game_announcement",
          title: data.title,
          body: data.body,
          metadata: {
            gameTitle: game.title,
            sport: game.sport,
            locationName: game.locationName,
            scheduledAt: game.scheduledAt.toISOString(),
            announcementId,
            announcementTitle: data.title,
            audienceType: data.audienceType,
            requiresAck: data.requiresAck,
            threadParticipantUserId: recipientUserId,
          },
        })),
      );
    });
  });
