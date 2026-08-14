import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { communityPostsTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const updateCommunityPostSchema = z.object({
  postId: z.string().min(1),
  title: z.string().trim().min(1, "Title is required"),
  body: z.string().trim().min(1, "Body is required"),
});
export type UpdateCommunityPostInput = z.input<typeof updateCommunityPostSchema>;

export const $updateCommunityPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(updateCommunityPostSchema)
  .handler(async ({ context, data }) => {
    const [post] = await context.db
      .select({
        authorUserId: communityPostsTable.authorUserId,
        deletedAt: communityPostsTable.deletedAt,
      })
      .from(communityPostsTable)
      .where(eq(communityPostsTable.id, data.postId))
      .limit(1);

    if (!post) {
      throw new Error("Post not found.");
    }

    if (post.authorUserId !== context.userId) {
      throw new Error("You can only edit your own posts.");
    }

    if (post.deletedAt) {
      throw new Error("Deleted posts cannot be edited.");
    }

    await context.db
      .update(communityPostsTable)
      .set({
        title: data.title,
        body: data.body,
        updatedAt: new Date(),
      })
      .where(eq(communityPostsTable.id, data.postId));
  });
