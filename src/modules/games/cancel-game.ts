import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { gamesTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { deleteAllGameCalendarEvents } from "@/modules/calendar/sync";

export const $cancelGame = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(z.object({ gameId: z.string() }))
  .handler(async ({ context, data }) => {
    const game = await context.db
      .select({ id: gamesTable.id })
      .from(gamesTable)
      .where(and(eq(gamesTable.id, data.gameId), eq(gamesTable.hostId, context.userId)))
      .limit(1);

    if (game.length === 0) throw new Error("Game not found");

    await deleteAllGameCalendarEvents(context.db, data.gameId);

    await context.db.delete(gamesTable).where(eq(gamesTable.id, data.gameId));
  });
