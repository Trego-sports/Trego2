import { createServerFn } from "@tanstack/react-start";
import { desc, eq, isNull, sql } from "drizzle-orm";
import { communityCommentsTable, communityPostsTable, usersTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { COMMUNITY_FEED_LIMIT } from "./types";
import { getAuthorRelationships, toCommunityAuthor } from "./utils";

export const $getCommunityPosts = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .handler(async ({ context }) => {
    const rows = await context.db
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
      .where(isNull(communityPostsTable.deletedAt))
      .orderBy(desc(communityPostsTable.createdAt))
      .limit(COMMUNITY_FEED_LIMIT);

    const relationships = await getAuthorRelationships(
      context.db,
      context.userId,
      rows.map((row) => row.authorUserId),
    );

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
      commentCount: row.commentCount,
      author: toCommunityAuthor(
        {
          userId: row.authorUserId,
          name: row.authorName,
          profilePictureUrl: row.authorProfilePictureUrl,
        },
        relationships,
      ),
    }));
  });
