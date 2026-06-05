import { createServerFn } from "@tanstack/react-start";
import { and, eq, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";
import { gameParticipantsTable, gamesTable, usersTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const $getInviteCandidates = createServerFn({ method: "GET" })
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

    if (game.hostId !== context.userId) {
      throw new Error("Only the game host can invite players.");
    }

    const userGames = alias(gameParticipantsTable, "user_games");

    return await context.db
      .select({
        userId: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        profilePictureUrl: usersTable.profilePictureUrl,
      })
      .from(gameParticipantsTable)
      .innerJoin(userGames, eq(gameParticipantsTable.gameId, userGames.gameId))
      .innerJoin(usersTable, eq(gameParticipantsTable.userId, usersTable.id))
      .where(
        and(
          eq(userGames.userId, context.userId),
          ne(gameParticipantsTable.userId, context.userId),
          sql`NOT EXISTS (
            SELECT 1 FROM ${gameParticipantsTable}
            WHERE ${gameParticipantsTable.gameId} = ${data.gameId}
            AND ${gameParticipantsTable.userId} = ${usersTable.id}
          )`,
        ),
      )
      .groupBy(usersTable.id, usersTable.name, usersTable.email, usersTable.profilePictureUrl)
      .orderBy(sql`COUNT(DISTINCT ${gameParticipantsTable.gameId}) DESC`)
      .limit(50);
  });
