import { createServerFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { gameParticipantsTable, gamesTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const $joinGame = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(z.object({ gameId: z.string() }))
  .handler(async ({ context, data }) => {
    await context.db.transaction(async (tx) => {
      // Check if game is full within transaction to prevent race conditions
      const result = await tx
        .select({
          spotsTotal: gamesTable.spotsTotal,
          participantCount: sql<number>`COUNT(${gameParticipantsTable.userId})`,
        })
        .from(gamesTable)
        .leftJoin(gameParticipantsTable, eq(gamesTable.id, gameParticipantsTable.gameId))
        .where(eq(gamesTable.id, data.gameId))
        .groupBy(gamesTable.id, gamesTable.spotsTotal)
        .limit(1);

      const gameData = result[0];
      if (gameData && gameData.participantCount >= gameData.spotsTotal) {
        throw new Error("This game is full");
      }

      // Add user as participant (unique constraint will prevent duplicates)
      await tx.insert(gameParticipantsTable).values({ gameId: data.gameId, userId: context.userId });
    });
  });
