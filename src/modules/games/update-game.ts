import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { gamesTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { createGameSchema } from "./create-game";

export const updateGameSchema = createGameSchema.omit({ sport: true }).extend({ gameId: z.string() });
export type UpdateGameInput = z.input<typeof updateGameSchema>;

export const $updateGame = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(updateGameSchema)
  .handler(async ({ context, data }) => {
    const updated = await context.db
      .update(gamesTable)
      .set({
        title: data.title,
        locationName: data.locationName,
        location: data.location,
        scheduledAt: data.scheduledAt,
        durationMinutes: data.durationMinutes,
        allowedSkillLevels: data.allowedSkillLevels,
        spotsTotal: data.spotsTotal,
      })
      .where(and(eq(gamesTable.id, data.gameId), eq(gamesTable.hostId, context.userId)))
      .returning({ id: gamesTable.id });

    if (updated.length === 0) throw new Error("Game not found");
  });
