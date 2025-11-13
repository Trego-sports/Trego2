import { createServerFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { gameParticipantsTable, gamesTable, usersTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const $getGameParticipants = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(z.object({ gameId: z.string() }))
  .handler(async ({ context, data }) => {
    return await context.db
      .select({
        userId: usersTable.id,
        name: usersTable.name,
        profilePictureUrl: usersTable.profilePictureUrl,
        isHost: sql<boolean>`${gamesTable.hostId} = ${usersTable.id}`,
      })
      .from(gameParticipantsTable)
      .innerJoin(usersTable, eq(gameParticipantsTable.userId, usersTable.id))
      .innerJoin(gamesTable, eq(gameParticipantsTable.gameId, gamesTable.id))
      .where(eq(gameParticipantsTable.gameId, data.gameId))
      .orderBy(usersTable.name);
  });
