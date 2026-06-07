import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { gameParticipantsTable, gamesTable, usersTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const $getPastGames = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .handler(async ({ context }) => {
    return await context.db
      .select({
        id: gamesTable.id,
        sport: gamesTable.sport,
        title: gamesTable.title,
        locationName: gamesTable.locationName,
        scheduledAt: gamesTable.scheduledAt,
        durationMinutes: gamesTable.durationMinutes,
        hostId: gamesTable.hostId,
        hostName: usersTable.name,
        isHost: sql<boolean>`${gamesTable.hostId} = ${context.userId}`,
        attendanceStatus: gameParticipantsTable.attendanceStatus,
        attendanceFinalizedAt: gamesTable.attendanceFinalizedAt,
      })
      .from(gamesTable)
      .innerJoin(
        gameParticipantsTable,
        and(eq(gamesTable.id, gameParticipantsTable.gameId), eq(gameParticipantsTable.userId, context.userId)),
      )
      .innerJoin(usersTable, eq(gamesTable.hostId, usersTable.id))
      .where(sql`${gamesTable.scheduledAt} + (${gamesTable.durationMinutes} || ' minutes')::interval < ${new Date()}`)
      .orderBy(sql`${gamesTable.scheduledAt} DESC`);
  });
