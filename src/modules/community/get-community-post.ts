import { createServerFn } from "@tanstack/react-start";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { communityCommentsTable, communityPostsTable, usersTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import type { CommunityComment } from "./types";
import { getAuthorRelationships, toCommunityAuthor } from "./utils";

export const getCommunityPostSchema = z.object({
  postId: z.string().min(1),
});
export type GetCommunityPostInput = z.input<typeof getCommunityPostSchema>;

export const $getCommunityPost = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(getCommunityPostSchema)
  .handler(async ({ context, data }) => {
    const [post] = await context.db
      .select({
        id: communityPostsTable.id,
        title: communityPostsTable.title,
        body: communityPostsTable.body,
        createdAt: communityPostsTable.createdAt,
        updatedAt: communityPostsTable.updatedAt,
        deletedAt: communityPostsTable.deletedAt,
        commentCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${communityCommentsTable}
          WHERE ${communityCommentsTable.postId} = ${communityPostsTable.id}
        )`,
        authorUserId: usersTable.id,
        authorName: usersTable.name,
        authorProfilePictureUrl: usersTable.profilePictureUrl,
      })
      .from(communityPostsTable)
      .innerJoin(usersTable, eq(communityPostsTable.authorUserId, usersTable.id))
      .where(eq(communityPostsTable.id, data.postId))
      .limit(1);

    if (!post) {
      throw new Error("Post not found.");
    }

    const commentRows = await context.db
      .select({
        id: communityCommentsTable.id,
        body: communityCommentsTable.body,
        createdAt: communityCommentsTable.createdAt,
        updatedAt: communityCommentsTable.updatedAt,
        deletedAt: communityCommentsTable.deletedAt,
        parentCommentId: communityCommentsTable.parentCommentId,
        authorUserId: usersTable.id,
        authorName: usersTable.name,
        authorProfilePictureUrl: usersTable.profilePictureUrl,
      })
      .from(communityCommentsTable)
      .innerJoin(usersTable, eq(communityCommentsTable.authorUserId, usersTable.id))
      .where(eq(communityCommentsTable.postId, data.postId))
      .orderBy(desc(communityCommentsTable.createdAt));

    const relationships = await getAuthorRelationships(context.db, context.userId, [
      post.authorUserId,
      ...commentRows.map((row) => row.authorUserId),
    ]);

    const commentsByParent = new Map<string | null, typeof commentRows>();
    for (const row of commentRows) {
      const key = row.parentCommentId ?? null;
      const group = commentsByParent.get(key) ?? [];
      group.push(row);
      commentsByParent.set(key, group);
    }

    const toComment = (row: (typeof commentRows)[number], replies: CommunityComment[]): CommunityComment => ({
      id: row.id,
      body: row.body,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
      author: toCommunityAuthor(
        {
          userId: row.authorUserId,
          name: row.authorName,
          profilePictureUrl: row.authorProfilePictureUrl,
        },
        relationships,
      ),
      replies,
    });

    const comments = (commentsByParent.get(null) ?? []).map((row) =>
      toComment(
        row,
        (commentsByParent.get(row.id) ?? []).map((reply) => toComment(reply, [])),
      ),
    );

    return {
      id: post.id,
      title: post.title,
      body: post.body,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      deletedAt: post.deletedAt,
      commentCount: post.commentCount,
      author: toCommunityAuthor(
        {
          userId: post.authorUserId,
          name: post.authorName,
          profilePictureUrl: post.authorProfilePictureUrl,
        },
        relationships,
      ),
      comments,
    };
  });
