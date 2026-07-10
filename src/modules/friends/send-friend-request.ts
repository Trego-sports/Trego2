import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { friendRequestsTable, friendshipsTable, usersTable } from "@/db/tables";
import { generateId } from "@/lib/id";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { getFriendshipPair } from "./utils";

export const sendFriendRequestSchema = z.object({
  recipientUserId: z.string(),
  requestMessage: z.string().trim().max(280, "Friend request message must be 280 characters or less.").optional(),
});
export type SendFriendRequestInput = z.input<typeof sendFriendRequestSchema>;

export const $sendFriendRequest = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(sendFriendRequestSchema)
  .handler(async ({ context, data }) => {
    if (data.recipientUserId === context.userId) {
      throw new Error("You cannot send a friend request to yourself.");
    }

    await context.db.transaction(async (tx) => {
      const [recipient] = await tx
        .select({
          id: usersTable.id,
          name: usersTable.name,
        })
        .from(usersTable)
        .where(eq(usersTable.id, data.recipientUserId))
        .limit(1);

      if (!recipient) {
        throw new Error("User not found.");
      }

      const pair = getFriendshipPair(context.userId, data.recipientUserId);
      const [existingFriendship] = await tx
        .select({ userAId: friendshipsTable.userAId })
        .from(friendshipsTable)
        .where(and(eq(friendshipsTable.userAId, pair.userAId), eq(friendshipsTable.userBId, pair.userBId)))
        .limit(1);

      if (existingFriendship) {
        throw new Error("You are already friends with this user.");
      }

      const [outgoingRequest] = await tx
        .select({
          id: friendRequestsTable.id,
          status: friendRequestsTable.status,
        })
        .from(friendRequestsTable)
        .where(
          and(
            eq(friendRequestsTable.requesterUserId, context.userId),
            eq(friendRequestsTable.recipientUserId, data.recipientUserId),
          ),
        )
        .limit(1);

      if (outgoingRequest?.status === "pending") {
        throw new Error("Friend request already sent.");
      }

      const [incomingRequest] = await tx
        .select({
          id: friendRequestsTable.id,
          status: friendRequestsTable.status,
        })
        .from(friendRequestsTable)
        .where(
          and(
            eq(friendRequestsTable.requesterUserId, data.recipientUserId),
            eq(friendRequestsTable.recipientUserId, context.userId),
          ),
        )
        .limit(1);

      if (incomingRequest?.status === "pending") {
        throw new Error("This user already sent you a friend request.");
      }

      const now = new Date();
      let friendRequestId = outgoingRequest?.id;
      const requestMessage = data.requestMessage?.trim() || null;

      if (outgoingRequest) {
        await tx
          .update(friendRequestsTable)
          .set({
            requestMessage,
            status: "pending",
            respondedAt: null,
            updatedAt: now,
          })
          .where(eq(friendRequestsTable.id, outgoingRequest.id));
      } else {
        friendRequestId = generateId("friend_req");
        await tx.insert(friendRequestsTable).values({
          id: friendRequestId,
          requesterUserId: context.userId,
          recipientUserId: data.recipientUserId,
          requestMessage,
        });
      }

      if (!friendRequestId) {
        throw new Error("Failed to create friend request.");
      }
    });
  });
