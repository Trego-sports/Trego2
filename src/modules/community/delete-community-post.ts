import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { communityPostsTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const deleteCommunityPostSchema = z.object({
  postId: z.string().min(1),
});
export type DeleteCommunityPostInput = z.input<typeof deleteCommunityPostSchema>;

export const $deleteCommunityPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(deleteCommunityPostSchema)
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
      throw new Error("You can only delete your own posts.");
    }

    if (post.deletedAt) {
      throw new Error("This post is already deleted.");
    }

    const now = new Date();
    await context.db
      .update(communityPostsTable)
      .set({
        deletedAt: now,
        updatedAt: now,
      })
      .where(eq(communityPostsTable.id, data.postId));
  });
