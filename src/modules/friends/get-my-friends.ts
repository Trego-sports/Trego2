import { createServerFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";
import { friendMessagesTable, friendshipsTable, usersTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const $getMyFriends = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .handler(async ({ context }) => {
    const friendsAsUserA = await context.db
      .select({
        userId: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        profilePictureUrl: usersTable.profilePictureUrl,
        friendsSince: friendshipsTable.createdAt,
        unreadCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${friendMessagesTable}
          WHERE ${friendMessagesTable.userAId} = ${friendshipsTable.userAId}
            AND ${friendMessagesTable.userBId} = ${friendshipsTable.userBId}
            AND ${friendMessagesTable.senderUserId} = ${usersTable.id}
            AND ${friendMessagesTable.readAt} IS NULL
        )`,
      })
      .from(friendshipsTable)
      .innerJoin(usersTable, eq(friendshipsTable.userBId, usersTable.id))
      .where(eq(friendshipsTable.userAId, context.userId));

    const friendsAsUserB = await context.db
      .select({
        userId: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        profilePictureUrl: usersTable.profilePictureUrl,
        friendsSince: friendshipsTable.createdAt,
        unreadCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${friendMessagesTable}
          WHERE ${friendMessagesTable.userAId} = ${friendshipsTable.userAId}
            AND ${friendMessagesTable.userBId} = ${friendshipsTable.userBId}
            AND ${friendMessagesTable.senderUserId} = ${usersTable.id}
            AND ${friendMessagesTable.readAt} IS NULL
        )`,
      })
      .from(friendshipsTable)
      .innerJoin(usersTable, eq(friendshipsTable.userAId, usersTable.id))
      .where(eq(friendshipsTable.userBId, context.userId));

    return [...friendsAsUserA, ...friendsAsUserB].sort((left, right) => left.name.localeCompare(right.name));
  });
