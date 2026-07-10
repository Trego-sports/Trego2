import { createServerFn } from "@tanstack/react-start";
import { and, eq, ilike, ne, or, sql } from "drizzle-orm";
import { z } from "zod";
import { friendRequestsTable, friendshipsTable, usersTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { getFriendshipPair } from "./utils";

export const searchUsersSchema = z.object({
  query: z.string().trim().min(2, "Search must be at least 2 characters").max(100),
});
export type SearchUsersInput = z.input<typeof searchUsersSchema>;

export const $searchUsers = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(searchUsersSchema)
  .handler(async ({ context, data }) => {
    const query = data.query.trim();

    const users = await context.db
      .select({
        userId: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        profilePictureUrl: usersTable.profilePictureUrl,
      })
      .from(usersTable)
      .where(
        and(
          ne(usersTable.id, context.userId),
          or(ilike(usersTable.name, `%${query}%`), ilike(usersTable.email, `%${query}%`)),
        ),
      )
      .orderBy(sql`lower(${usersTable.name})`)
      .limit(20);

    return await Promise.all(
      users.map(async (user) => {
        const pair = getFriendshipPair(context.userId, user.userId);
        const [friendship] = await context.db
          .select({ userAId: friendshipsTable.userAId })
          .from(friendshipsTable)
          .where(and(eq(friendshipsTable.userAId, pair.userAId), eq(friendshipsTable.userBId, pair.userBId)))
          .limit(1);

        const [outgoingRequest] = await context.db
          .select({
            id: friendRequestsTable.id,
            requestMessage: friendRequestsTable.requestMessage,
            status: friendRequestsTable.status,
          })
          .from(friendRequestsTable)
          .where(
            and(
              eq(friendRequestsTable.requesterUserId, context.userId),
              eq(friendRequestsTable.recipientUserId, user.userId),
            ),
          )
          .limit(1);

        const [incomingRequest] = await context.db
          .select({
            id: friendRequestsTable.id,
            requestMessage: friendRequestsTable.requestMessage,
            status: friendRequestsTable.status,
          })
          .from(friendRequestsTable)
          .where(
            and(
              eq(friendRequestsTable.requesterUserId, user.userId),
              eq(friendRequestsTable.recipientUserId, context.userId),
            ),
          )
          .limit(1);

        return {
          ...user,
          isFriend: Boolean(friendship),
          outgoingRequest: outgoingRequest ?? null,
          incomingRequest: incomingRequest ?? null,
        };
      }),
    );
  });
