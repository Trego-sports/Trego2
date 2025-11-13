import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { gamesTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const $getGame = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(z.object({ gameId: z.string() }))
  .handler(async ({ context, data }) => {
    const queryResult = await context.db
      .select({
        id: gamesTable.id,
        sport: gamesTable.sport,
        title: gamesTable.title,
        locationName: gamesTable.locationName,
        location: gamesTable.location,
        scheduledAt: gamesTable.scheduledAt,
        durationMinutes: gamesTable.durationMinutes,
        spotsTotal: gamesTable.spotsTotal,
        allowedSkillLevels: gamesTable.allowedSkillLevels,
      })
      .from(gamesTable)
      .where(eq(gamesTable.id, data.gameId))
      .limit(1);

    const game = queryResult[0];
    if (!game) {
      throw new Error("Game not found");
    }

    return game;
  });
