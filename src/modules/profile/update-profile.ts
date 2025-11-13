import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { playerSportsTable, usersTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { skillLevelSchema, sportsSchema } from "@/modules/sports/sports";

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  location: z
    .object({
      lat: z.coerce.number<string>().min(-90).max(90).nullable(),
      lon: z.coerce.number<string>().min(-180).max(180).nullable(),
    })
    .transform((data) => (data?.lat && data?.lon ? { lat: data.lat, lon: data.lon } : null)),
  sports: z.array(
    z.object({
      sport: sportsSchema,
      skillLevel: skillLevelSchema,
      position: z.string().max(50).nullable(),
    }),
  ),
});

export type ProfileFormInput = z.input<typeof updateProfileSchema>;

export const $updateProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(updateProfileSchema)
  .handler(async ({ context, data }) => {
    await context.db.transaction(async (tx) => {
      // Update user with profile data
      await tx
        .update(usersTable)
        .set({ name: data.name, location: data.location })
        .where(eq(usersTable.id, context.userId));

      // Delete existing player sports
      await tx.delete(playerSportsTable).where(eq(playerSportsTable.userId, context.userId));

      // Insert new player sports (only if there are any)
      if (data.sports.length > 0) {
        await tx.insert(playerSportsTable).values(
          data.sports.map((sport) => ({
            userId: context.userId,
            sport: sport.sport,
            skillLevel: sport.skillLevel,
            position: sport.position ?? null,
          })),
        );
      }
    });
  });
