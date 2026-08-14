import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { communityCommentsTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const deleteCommunityCommentSchema = z.object({
  commentId: z.string().min(1),
});
export type DeleteCommunityCommentInput = z.input<typeof deleteCommunityCommentSchema>;

export const $deleteCommunityComment = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(deleteCommunityCommentSchema)
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
      throw new Error("You can only delete your own comments.");
    }

    if (comment.deletedAt) {
      throw new Error("This comment is already deleted.");
    }

    const now = new Date();
    await context.db
      .update(communityCommentsTable)
      .set({
        deletedAt: now,
        updatedAt: now,
      })
      .where(eq(communityCommentsTable.id, data.commentId));
  });
