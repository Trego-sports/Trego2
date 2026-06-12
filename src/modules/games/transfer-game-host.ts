import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { gameParticipantsTable, gamesTable, usersTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { createNotification } from "@/modules/notifications";

export const transferGameHostSchema = z.object({
  gameId: z.string(),
  newHostUserId: z.string(),
});
export type TransferGameHostInput = z.input<typeof transferGameHostSchema>;

export const $transferGameHost = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(transferGameHostSchema)
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
        throw new Error("Only the current host can transfer ownership.");
      }

      if (data.newHostUserId === context.userId) {
        throw new Error("You are already the host of this game.");
      }

      const [newHost] = await tx
        .select({
          userId: gameParticipantsTable.userId,
          name: usersTable.name,
        })
        .from(gameParticipantsTable)
        .innerJoin(usersTable, eq(gameParticipantsTable.userId, usersTable.id))
        .where(and(eq(gameParticipantsTable.gameId, data.gameId), eq(gameParticipantsTable.userId, data.newHostUserId)))
        .limit(1);

      if (!newHost) {
        throw new Error("The new host must be a participant in this game.");
      }

      await tx.update(gamesTable).set({ hostId: data.newHostUserId }).where(eq(gamesTable.id, data.gameId));

      await createNotification(tx, {
        recipientUserId: data.newHostUserId,
        actorUserId: context.userId,
        gameId: data.gameId,
        type: "game_host_transferred",
        title: "You are now the host",
        body: `You are now the host of "${game.title}".`,
        metadata: {
          gameTitle: game.title,
          sport: game.sport,
          locationName: game.locationName,
          scheduledAt: game.scheduledAt.toISOString(),
          newHostName: newHost.name,
        },
      });
    });
  });
