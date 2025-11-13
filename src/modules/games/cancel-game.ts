import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { gamesTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const $cancelGame = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(z.object({ gameId: z.string() }))
  .handler(async ({ context, data }) => {
    const deleted = await context.db
      .delete(gamesTable)
      .where(and(eq(gamesTable.id, data.gameId), eq(gamesTable.hostId, context.userId)))
      .returning({ id: gamesTable.id });

    if (deleted.length === 0) throw new Error("Game not found");
  });
