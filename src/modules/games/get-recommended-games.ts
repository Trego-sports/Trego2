import { createServerFn } from "@tanstack/react-start";
import { gt, sql } from "drizzle-orm";
import { gameParticipantsTable, gamesTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { buildGamesQuery } from "./utils";

export const $getRecommendedGames = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .handler(async ({ context }) => {
    return await buildGamesQuery(context.db, context.userId, [
      gt(gamesTable.scheduledAt, new Date()),
      // Exclude games where user is already participating
      sql`NOT EXISTS (
        SELECT 1 FROM ${gameParticipantsTable}
        WHERE ${gameParticipantsTable.gameId} = ${gamesTable.id}
        AND ${gameParticipantsTable.userId} = ${context.userId}
      )`,
    ]);
  });
