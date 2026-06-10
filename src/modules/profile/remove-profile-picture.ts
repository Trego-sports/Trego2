import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { usersTable } from "@/db/tables";
import { getAvatarStorageKeyFromUrl } from "@/lib/avatars";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const $removeProfilePicture = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .handler(async ({ context }) => {
    const [existingUser] = await context.db
      .select({ profilePictureUrl: usersTable.profilePictureUrl })
      .from(usersTable)
      .where(eq(usersTable.id, context.userId))
      .limit(1);

    if (!existingUser) {
      throw new Error("User not found");
    }

    if (!existingUser.profilePictureUrl) {
      return;
    }

    await context.db.update(usersTable).set({ profilePictureUrl: null }).where(eq(usersTable.id, context.userId));

    const previousStorageKey = getAvatarStorageKeyFromUrl(existingUser.profilePictureUrl);
    if (previousStorageKey) {
      await env.AVATARS.delete(previousStorageKey);
    }
  });
