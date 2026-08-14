import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { communityPostsTable } from "@/db/tables";
import { generateId } from "@/lib/id";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const createCommunityPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  body: z.string().trim().min(1, "Body is required"),
});
export type CreateCommunityPostInput = z.input<typeof createCommunityPostSchema>;

export const $createCommunityPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(createCommunityPostSchema)
  .handler(async ({ context, data }) => {
    const postId = generateId("post");

    await context.db.insert(communityPostsTable).values({
      id: postId,
      authorUserId: context.userId,
      title: data.title,
      body: data.body,
    });

    return { postId };
  });
