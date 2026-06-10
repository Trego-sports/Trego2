import { createServerFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { gameParticipantsTable, gamesTable, usersTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { getUserAttendanceStats } from "@/modules/attendance";
import { upsertGameEvent } from "@/modules/calendar/sync";
import { createNotifications } from "@/modules/notifications";

export const $joinGame = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(z.object({ gameId: z.string() }))
  .handler(async ({ context, data }) => {
    await context.db.transaction(async (tx) => {
      // Check if game is full within transaction to prevent race conditions
      const result = await tx
        .select({
          spotsTotal: gamesTable.spotsTotal,
          hostId: gamesTable.hostId,
          sport: gamesTable.sport,
          title: gamesTable.title,
          locationName: gamesTable.locationName,
          scheduledAt: gamesTable.scheduledAt,
          requiresAttendanceScore: gamesTable.requiresAttendanceScore,
          minimumAttendanceScore: gamesTable.minimumAttendanceScore,
          allowPlayersWithoutAttendanceHistory: gamesTable.allowPlayersWithoutAttendanceHistory,
          participantCount: sql<number>`COUNT(${gameParticipantsTable.userId})`,
        })
        .from(gamesTable)
        .leftJoin(gameParticipantsTable, eq(gamesTable.id, gameParticipantsTable.gameId))
        .where(eq(gamesTable.id, data.gameId))
        .groupBy(gamesTable.id)
        .limit(1);

      const gameData = result[0];
      if (!gameData) {
        throw new Error("Game not found");
      }

      if (gameData.participantCount >= gameData.spotsTotal) {
        throw new Error("This game is full");
      }

      if (gameData.requiresAttendanceScore) {
        if (gameData.minimumAttendanceScore === null) {
          throw new Error("This game has an invalid attendance requirement.");
        }

        const attendanceStats = await getUserAttendanceStats(tx, context.userId);

        if (!attendanceStats.hasAttendanceHistory) {
          if (!gameData.allowPlayersWithoutAttendanceHistory) {
            throw new Error("This game requires attendance history before joining.");
          }
        } else if (
          attendanceStats.attendanceScore !== null &&
          attendanceStats.attendanceScore < gameData.minimumAttendanceScore
        ) {
          throw new Error(`This game requires an attendance score of at least ${gameData.minimumAttendanceScore}%.`);
        }
      }

      // Add user as participant (unique constraint will prevent duplicates)
      await tx.insert(gameParticipantsTable).values({ gameId: data.gameId, userId: context.userId });

      const [joiningUser] = await tx
        .select({ name: usersTable.name })
        .from(usersTable)
        .where(eq(usersTable.id, context.userId))
        .limit(1);

      await createNotifications(tx, [
        {
          recipientUserId: context.userId,
          actorUserId: context.userId,
          gameId: data.gameId,
          type: "game_joined",
          title: "Game joined",
          body: `You joined "${gameData.title}".`,
          metadata: {
            gameTitle: gameData.title,
            sport: gameData.sport,
            locationName: gameData.locationName,
            scheduledAt: gameData.scheduledAt.toISOString(),
          },
        },
        {
          recipientUserId: gameData.hostId,
          actorUserId: context.userId,
          gameId: data.gameId,
          type: "game_joined",
          title: "Player joined your game",
          body: `${joiningUser?.name ?? "A player"} joined "${gameData.title}".`,
          metadata: {
            gameTitle: gameData.title,
            sport: gameData.sport,
            locationName: gameData.locationName,
            scheduledAt: gameData.scheduledAt.toISOString(),
            playerName: joiningUser?.name ?? "A player",
          },
        },
      ]);
    });

    await upsertGameEvent(context.db, context.userId, data.gameId);
  });
