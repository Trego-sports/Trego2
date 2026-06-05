import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { usersTable } from "@/db/tables";
import {
  AVATAR_CONTENT_TYPES,
  AVATAR_MAX_BYTES,
  buildAvatarPublicPath,
  buildAvatarStorageKey,
  getAvatarExtension,
  getAvatarStorageKeyFromUrl,
  isAvatarContentType,
} from "@/lib/avatars";
import { generateId } from "@/lib/id";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const uploadProfilePictureSchema = z.object({
  fileBase64: z.string().min(1, "Image data is required"),
  contentType: z.enum(AVATAR_CONTENT_TYPES),
});

export type UploadProfilePictureInput = z.input<typeof uploadProfilePictureSchema>;

export const $uploadProfilePicture = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(uploadProfilePictureSchema)
  .handler(async ({ context, data }) => {
    if (!isAvatarContentType(data.contentType)) {
      throw new Error("Unsupported image type. Use JPG, PNG, or WebP.");
    }

    const bytes = Uint8Array.from(atob(data.fileBase64), (char) => char.charCodeAt(0));
    if (bytes.byteLength === 0) {
      throw new Error("Image file is empty.");
    }

    if (bytes.byteLength > AVATAR_MAX_BYTES) {
      throw new Error("Image must be 2MB or smaller.");
    }

    const [existingUser] = await context.db
      .select({ profilePictureUrl: usersTable.profilePictureUrl })
      .from(usersTable)
      .where(eq(usersTable.id, context.userId))
      .limit(1);

    if (!existingUser) {
      throw new Error("User not found");
    }

    const filename = `${generateId("avatar")}.${getAvatarExtension(data.contentType)}`;
    const storageKey = buildAvatarStorageKey(context.userId, filename);
    const profilePictureUrl = buildAvatarPublicPath(context.userId, filename);

    await env.AVATARS.put(storageKey, bytes, {
      httpMetadata: { contentType: data.contentType },
    });

    await context.db.update(usersTable).set({ profilePictureUrl }).where(eq(usersTable.id, context.userId));

    const previousStorageKey = getAvatarStorageKeyFromUrl(existingUser.profilePictureUrl);
    if (previousStorageKey) {
      await env.AVATARS.delete(previousStorageKey);
    }

    return { profilePictureUrl };
  });
