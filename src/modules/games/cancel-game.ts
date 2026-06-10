import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { gameParticipantsTable, gamesTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { deleteAllGameCalendarEvents } from "@/modules/calendar/sync";
import { createNotifications } from "@/modules/notifications";

export const $cancelGame = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(z.object({ gameId: z.string() }))
  .handler(async ({ context, data }) => {
    const [game] = await context.db
      .select({
        id: gamesTable.id,
        sport: gamesTable.sport,
        title: gamesTable.title,
        locationName: gamesTable.locationName,
        scheduledAt: gamesTable.scheduledAt,
      })
      .from(gamesTable)
      .where(and(eq(gamesTable.id, data.gameId), eq(gamesTable.hostId, context.userId)))
      .limit(1);

    if (!game) throw new Error("Game not found");

    const participants = await context.db
      .select({ userId: gameParticipantsTable.userId })
      .from(gameParticipantsTable)
      .where(eq(gameParticipantsTable.gameId, data.gameId));

    await deleteAllGameCalendarEvents(context.db, data.gameId);

    await context.db.transaction(async (tx) => {
      await createNotifications(
        tx,
        participants.map((participant) => ({
          recipientUserId: participant.userId,
          actorUserId: context.userId,
          gameId: data.gameId,
          type: "game_cancelled",
          title: "Game cancelled",
          body: `"${game.title}" has been cancelled by the host.`,
          metadata: {
            gameTitle: game.title,
            sport: game.sport,
            locationName: game.locationName,
            scheduledAt: game.scheduledAt.toISOString(),
          },
        })),
      );

      await tx.delete(gamesTable).where(eq(gamesTable.id, data.gameId));
    });
  });
