import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { gameParticipantsTable, gamesTable } from "@/db/tables";
import { generateId } from "@/lib/id";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { skillLevelSchema, sportsSchema } from "@/modules/sports/sports";

export const createGameSchema = z.object({
  sport: sportsSchema,
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  locationName: z.string().min(1, "Location name is required").max(200, "Location name too long"),
  location: z.object({
    lat: z.coerce.number<string>().min(-90).max(90),
    lon: z.coerce.number<string>().min(-180).max(180),
  }),
  scheduledAt: z.date().min(new Date(Date.now() + 60000), "Scheduled at must be in the future"),
  durationMinutes: z.int().positive("Duration must be positive"),
  allowedSkillLevels: z.array(skillLevelSchema).min(1, "Select at least one skill level"),
  spotsTotal: z.int().min(2, "Need at least 2 spots"),
});
export type CreateGameInput = z.input<typeof createGameSchema>;

export const $createGame = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(createGameSchema)
  .handler(async ({ context, data }) => {
    const gameId = generateId("game");

    await context.db.transaction(async (tx) => {
      // Create the game
      await tx.insert(gamesTable).values({
        id: gameId,
        sport: data.sport,
        title: data.title,
        locationName: data.locationName,
        location: data.location,
        scheduledAt: data.scheduledAt,
        durationMinutes: data.durationMinutes,
        allowedSkillLevels: data.allowedSkillLevels,
        spotsTotal: data.spotsTotal,
        hostId: context.userId,
      });

      // Automatically add the host as a participant
      await tx.insert(gameParticipantsTable).values({ gameId: gameId, userId: context.userId });
    });
  });
