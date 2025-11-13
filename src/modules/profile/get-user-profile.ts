import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const $getUserProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ context, data }) => {
    const user = await context.db.query.usersTable.findFirst({
      columns: {
        id: true,
        name: true,
        profilePictureUrl: true,
      },
      where: (usersTable, { eq }) => eq(usersTable.id, data.userId),
      with: {
        playerSports: {
          columns: {
            sport: true,
            skillLevel: true,
            position: true,
          },
        },
        gameParticipants: {
          columns: {
            gameId: true,
          },
          with: {
            game: {
              columns: {
                id: true,
                sport: true,
                title: true,
                scheduledAt: true,
                locationName: true,
                hostId: true,
              },
              with: {
                host: {
                  columns: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      name: user.name,
      profilePictureUrl: user.profilePictureUrl,
      sports: user.playerSports.map((ps) => ({
        sport: ps.sport,
        skillLevel: ps.skillLevel,
        position: ps.position ?? undefined,
      })),
      games: user.gameParticipants.map((gp) => ({
        id: gp.game.id,
        sport: gp.game.sport,
        title: gp.game.title,
        scheduledAt: gp.game.scheduledAt,
        locationName: gp.game.locationName,
        hostId: gp.game.hostId,
        hostName: gp.game.host.name,
        isHost: gp.game.hostId === data.userId,
      })),
    };
  });
