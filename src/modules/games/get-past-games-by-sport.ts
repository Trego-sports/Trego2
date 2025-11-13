import { createServerFn } from "@tanstack/react-start";
import { and, eq, lt, sql } from "drizzle-orm";
import { gameParticipantsTable, gamesTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const $getPastGamesBySport = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .handler(async ({ context }) => {
    return await context.db
      .select({
        sport: gamesTable.sport,
        count: sql<number>`COUNT(DISTINCT ${gamesTable.id})`,
      })
      .from(gamesTable)
      .innerJoin(
        gameParticipantsTable,
        and(eq(gamesTable.id, gameParticipantsTable.gameId), eq(gameParticipantsTable.userId, context.userId)),
      )
      .where(lt(gamesTable.scheduledAt, new Date()))
      .groupBy(gamesTable.sport)
      .orderBy(gamesTable.sport);
  });
