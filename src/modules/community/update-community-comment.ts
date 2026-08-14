import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { communityCommentsTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const updateCommunityCommentSchema = z.object({
  commentId: z.string().min(1),
  body: z.string().trim().min(1, "Comment is required"),
});
export type UpdateCommunityCommentInput = z.input<typeof updateCommunityCommentSchema>;

export const $updateCommunityComment = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(updateCommunityCommentSchema)
  .handler(async ({ context, data }) => {
    const [comment] = await context.db
      .select({
        authorUserId: communityCommentsTable.authorUserId,
        deletedAt: communityCommentsTable.deletedAt,
      })
      .from(communityCommentsTable)
      .where(eq(communityCommentsTable.id, data.commentId))
      .limit(1);

    if (!comment) {
      throw new Error("Comment not found.");
    }

    if (comment.authorUserId !== context.userId) {
      throw new Error("You can only edit your own comments.");
    }

    if (comment.deletedAt) {
      throw new Error("Deleted comments cannot be edited.");
    }

    await context.db
      .update(communityCommentsTable)
      .set({
        body: data.body,
        updatedAt: new Date(),
      })
      .where(eq(communityCommentsTable.id, data.commentId));
  });
