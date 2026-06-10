import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { gameParticipantsTable, gamesTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { deleteGameEvent } from "@/modules/calendar/sync";

export const $leaveGame = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(z.object({ gameId: z.string() }))
  .handler(async ({ context, data }) => {
    const [game] = await context.db
      .select({ hostId: gamesTable.hostId })
      .from(gamesTable)
      .where(eq(gamesTable.id, data.gameId))
      .limit(1);

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.hostId === context.userId) {
      throw new Error("Transfer ownership before leaving this game.");
    }

    await context.db
      .delete(gameParticipantsTable)
      .where(and(eq(gameParticipantsTable.gameId, data.gameId), eq(gameParticipantsTable.userId, context.userId)));

    await deleteGameEvent(context.db, context.userId, data.gameId);
  });
