import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { gameParticipantsTable, gamesTable, usersTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { deleteGameEvent } from "@/modules/calendar/sync";
import { createNotification } from "@/modules/notifications";

export const removeGameParticipantSchema = z.object({
  gameId: z.string(),
  userId: z.string(),
});
export type RemoveGameParticipantInput = z.input<typeof removeGameParticipantSchema>;

export const $removeGameParticipant = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(removeGameParticipantSchema)
  .handler(async ({ context, data }) => {
    await context.db.transaction(async (tx) => {
      const [game] = await tx
        .select({
          id: gamesTable.id,
          hostId: gamesTable.hostId,
          sport: gamesTable.sport,
          title: gamesTable.title,
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
        throw new Error("Only the game host can remove players.");
      }

      if (data.userId === context.userId || data.userId === game.hostId) {
        throw new Error("The host cannot be removed from the game.");
      }

      const [participant] = await tx
        .select({
          userId: gameParticipantsTable.userId,
          name: usersTable.name,
        })
        .from(gameParticipantsTable)
        .innerJoin(usersTable, eq(gameParticipantsTable.userId, usersTable.id))
        .where(and(eq(gameParticipantsTable.gameId, data.gameId), eq(gameParticipantsTable.userId, data.userId)))
        .limit(1);

      if (!participant) {
        throw new Error("Player is not in this game.");
      }

      await createNotification(tx, {
        recipientUserId: data.userId,
        actorUserId: context.userId,
        gameId: data.gameId,
        type: "game_removed",
        title: "Removed from game",
        body: `The host removed you from "${game.title}".`,
        metadata: {
          gameTitle: game.title,
          sport: game.sport,
          locationName: game.locationName,
          scheduledAt: game.scheduledAt.toISOString(),
          playerName: participant.name,
        },
      });

      await tx
        .delete(gameParticipantsTable)
        .where(and(eq(gameParticipantsTable.gameId, data.gameId), eq(gameParticipantsTable.userId, data.userId)));
    });

    await deleteGameEvent(context.db, data.userId, data.gameId);
  });
