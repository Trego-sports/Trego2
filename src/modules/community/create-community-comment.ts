import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { communityCommentsTable, communityPostsTable } from "@/db/tables";
import { generateId } from "@/lib/id";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const createCommunityCommentSchema = z.object({
  postId: z.string().min(1),
  body: z.string().trim().min(1, "Comment is required"),
  parentCommentId: z.string().min(1).optional(),
});
export type CreateCommunityCommentInput = z.input<typeof createCommunityCommentSchema>;

export const $createCommunityComment = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(createCommunityCommentSchema)
  .handler(async ({ context, data }) => {
    const [post] = await context.db
      .select({
        id: communityPostsTable.id,
        deletedAt: communityPostsTable.deletedAt,
      })
      .from(communityPostsTable)
      .where(eq(communityPostsTable.id, data.postId))
      .limit(1);

    if (!post) {
      throw new Error("Post not found.");
    }

    if (post.deletedAt) {
      throw new Error("This post is deleted, so new comments are closed.");
    }

    if (data.parentCommentId) {
      const [parent] = await context.db
        .select({
          id: communityCommentsTable.id,
          postId: communityCommentsTable.postId,
          parentCommentId: communityCommentsTable.parentCommentId,
          deletedAt: communityCommentsTable.deletedAt,
        })
        .from(communityCommentsTable)
        .where(eq(communityCommentsTable.id, data.parentCommentId))
        .limit(1);

      if (!parent || parent.postId !== data.postId) {
        throw new Error("Comment not found.");
      }

      if (parent.parentCommentId) {
        throw new Error("You can only reply to top-level comments.");
      }

      if (parent.deletedAt) {
        throw new Error("This comment is deleted, so new replies are closed.");
      }
    }

    const commentId = generateId("comment");

    await context.db.insert(communityCommentsTable).values({
      id: commentId,
      postId: data.postId,
      authorUserId: context.userId,
      parentCommentId: data.parentCommentId ?? null,
      body: data.body,
    });

    // TODO: Notify the post author when someone comments, and notify a comment
    // author when someone replies. Skip notifying the actor about their own activity.

    return { commentId };
  });
