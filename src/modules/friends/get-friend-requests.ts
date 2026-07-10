import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { friendRequestsTable, usersTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const $getFriendRequests = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .handler(async ({ context }) => {
    const requester = alias(usersTable, "friend_request_requester");
    const recipient = alias(usersTable, "friend_request_recipient");

    const incoming = await context.db
      .select({
        id: friendRequestsTable.id,
        requestMessage: friendRequestsTable.requestMessage,
        createdAt: friendRequestsTable.createdAt,
        requesterUserId: requester.id,
        requesterName: requester.name,
        requesterEmail: requester.email,
        requesterProfilePictureUrl: requester.profilePictureUrl,
      })
      .from(friendRequestsTable)
      .innerJoin(requester, eq(friendRequestsTable.requesterUserId, requester.id))
      .where(and(eq(friendRequestsTable.recipientUserId, context.userId), eq(friendRequestsTable.status, "pending")))
      .orderBy(desc(friendRequestsTable.createdAt));

    const outgoing = await context.db
      .select({
        id: friendRequestsTable.id,
        requestMessage: friendRequestsTable.requestMessage,
        createdAt: friendRequestsTable.createdAt,
        recipientUserId: recipient.id,
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        recipientProfilePictureUrl: recipient.profilePictureUrl,
      })
      .from(friendRequestsTable)
      .innerJoin(recipient, eq(friendRequestsTable.recipientUserId, recipient.id))
      .where(and(eq(friendRequestsTable.requesterUserId, context.userId), eq(friendRequestsTable.status, "pending")))
      .orderBy(desc(friendRequestsTable.createdAt));

    return { incoming, outgoing };
  });
