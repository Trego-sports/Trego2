import { eq, type SQL, sql } from "drizzle-orm";
import { gameParticipantsTable, gamesTable, usersTable } from "@/db/tables";
import { withConditions } from "@/db/utils";
import type { DBContext } from "@/lib/middleware/db";
import type { DashboardGame } from "./types";

// Builds, executes, and transforms a games query with given conditions
export async function buildGamesQuery(db: DBContext, userId: string, conditions: SQL[]): Promise<DashboardGame[]> {
  const baseQuery = db
    .select({
      id: gamesTable.id,
      sport: gamesTable.sport,
      title: gamesTable.title,
      locationName: gamesTable.locationName,
      location: gamesTable.location,
      scheduledAt: gamesTable.scheduledAt,
      durationMinutes: gamesTable.durationMinutes,
      spotsTotal: gamesTable.spotsTotal,
      spotsFilled: sql<number>`COUNT(${gameParticipantsTable.userId})`,
      allowedSkillLevels: gamesTable.allowedSkillLevels,
      hostId: gamesTable.hostId,
      hostName: usersTable.name,
      distance: sql<number | null>`(
        CASE 
          WHEN (SELECT location FROM ${usersTable} WHERE id = ${userId}) IS NOT NULL
          THEN ROUND(
            (ST_Distance(
              ${gamesTable.location},
              (SELECT location FROM ${usersTable} WHERE id = ${userId})
            ) / 1000.0)::numeric,
            2
          )
          ELSE NULL
        END
      )`,
    })
    .from(gamesTable)
    .leftJoin(gameParticipantsTable, eq(gamesTable.id, gameParticipantsTable.gameId))
    .leftJoin(usersTable, eq(gamesTable.hostId, usersTable.id))
    .groupBy(gamesTable.id, usersTable.name, gamesTable.durationMinutes)
    .orderBy(gamesTable.scheduledAt)
    .$dynamic();

  const games = await withConditions(baseQuery, conditions);

  return games.map((game) => ({
    id: game.id,
    sport: game.sport,
    title: game.title,
    locationName: game.locationName,
    location: game.location,
    scheduledAt: game.scheduledAt.getTime(),
    durationMinutes: game.durationMinutes,
    spotsTotal: game.spotsTotal,
    spotsFilled: game.spotsFilled,
    skillLevels: game.allowedSkillLevels,
    hostId: game.hostId,
    hostName: game.hostName ?? "Unknown",
    isHost: game.hostId === userId,
    distance: game.distance ?? undefined,
  }));
}
