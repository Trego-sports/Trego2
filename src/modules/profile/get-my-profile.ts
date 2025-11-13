import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const $getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .handler(async ({ context }) => {
    const user = await context.db.query.usersTable.findFirst({
      columns: {
        id: true,
        email: true,
        name: true,
        profilePictureUrl: true,
        location: true,
      },
      where: (usersTable, { eq }) => eq(usersTable.id, context.userId),
      with: {
        playerSports: {
          columns: {
            sport: true,
            skillLevel: true,
            position: true,
          },
        },
        oauthAccounts: {
          columns: {
            providerId: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  });
