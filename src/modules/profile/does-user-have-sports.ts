import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const $isSetupCompleted = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .handler(async ({ context }) => {
    const user = await context.db.query.usersTable.findFirst({
      where: (usersTable, { eq }) => eq(usersTable.id, context.userId),
      with: {
        playerSports: {
          columns: {
            sport: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user.playerSports.length > 0;
  });
