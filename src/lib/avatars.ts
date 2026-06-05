export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const AVATAR_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type AvatarContentType = (typeof AVATAR_CONTENT_TYPES)[number];

const AVATAR_PUBLIC_PATH_PREFIX = "/api/avatars/";

export function getAvatarExtension(contentType: AvatarContentType) {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
  }
}

export function buildAvatarStorageKey(userId: string, filename: string) {
  return `avatars/${userId}/${filename}`;
}

export function buildAvatarPublicPath(userId: string, filename: string) {
  return `${AVATAR_PUBLIC_PATH_PREFIX}${userId}/${filename}`;
}

export function getAvatarStorageKeyFromUrl(url: string | null | undefined) {
  if (!url?.startsWith(AVATAR_PUBLIC_PATH_PREFIX)) {
    return null;
  }

  return `avatars/${url.slice(AVATAR_PUBLIC_PATH_PREFIX.length)}`;
}

export function isAvatarContentType(contentType: string): contentType is AvatarContentType {
  return AVATAR_CONTENT_TYPES.includes(contentType as AvatarContentType);
}

export async function readFileAsBase64(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read image file."));
        return;
      }

      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Failed to read image file."));
        return;
      }

      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}
