import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { buildAvatarStorageKey } from "@/lib/avatars";

export const Route = createFileRoute("/api/avatars/$userId/$filename")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const storageKey = buildAvatarStorageKey(params.userId, params.filename);
        const object = await env.AVATARS.get(storageKey);

        if (!object) {
          return new Response("Avatar not found", { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("Cache-Control", "public, max-age=31536000, immutable");

        return new Response(object.body, { headers });
      },
    },
  },
});
