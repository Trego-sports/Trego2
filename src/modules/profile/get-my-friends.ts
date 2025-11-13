import { createServerFn } from "@tanstack/react-start";
import { and, eq, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { gameParticipantsTable, usersTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const $getMyFriends = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .handler(async ({ context }) => {
    // Create alias for self-join
    const userGames = alias(gameParticipantsTable, "user_games");

    // Find other users who participated in the same games as the current user, all in one query
    return await context.db
      .select({
        userId: usersTable.id,
        name: usersTable.name,
        profilePictureUrl: usersTable.profilePictureUrl,
        gamesTogether: sql<number>`COUNT(DISTINCT ${gameParticipantsTable.gameId})`,
      })
      .from(gameParticipantsTable)
      .innerJoin(userGames, eq(gameParticipantsTable.gameId, userGames.gameId))
      .innerJoin(usersTable, eq(gameParticipantsTable.userId, usersTable.id))
      .where(and(eq(userGames.userId, context.userId), ne(gameParticipantsTable.userId, context.userId)))
      .groupBy(usersTable.id, usersTable.name, usersTable.profilePictureUrl)
      .orderBy(sql`COUNT(DISTINCT ${gameParticipantsTable.gameId}) DESC`)
      .limit(4);
  });
