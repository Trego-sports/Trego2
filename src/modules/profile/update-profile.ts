import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { playerSportsTable, usersTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { skillLevelSchema, sportsSchema } from "@/modules/sports/sports";

const optionalCoordinate = (minimum: number, maximum: number) =>
  z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? null : value),
    z.coerce.number().min(minimum).max(maximum).nullable(),
  );

const locationSchema = z
  .object({
    lat: optionalCoordinate(-90, 90),
    lon: optionalCoordinate(-180, 180),
  })
  .superRefine((location, ctx) => {
    if ((location.lat === null) !== (location.lon === null)) {
      ctx.addIssue({
        code: "custom",
        message: "Enter both latitude and longitude, or leave both blank",
      });
    }
  })
  .transform((location) =>
    location.lat !== null && location.lon !== null ? { lat: location.lat, lon: location.lon } : null,
  );

export const updateProfileSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    location: locationSchema,
    sports: z.array(
      z.object({
        sport: sportsSchema,
        skillLevel: skillLevelSchema,
        position: z.string().max(50).nullable(),
      }),
    ),
  })
  .superRefine((profile, ctx) => {
    const seenSports = new Set<string>();
    profile.sports.forEach(({ sport }, index) => {
      if (seenSports.has(sport)) {
        ctx.addIssue({
          code: "custom",
          path: ["sports", index, "sport"],
          message: `${sport} is already in your profile`,
        });
      }
      seenSports.add(sport);
    });
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
