import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { friendRequestsTable, friendshipsTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { getFriendshipPair } from "./utils";

export const respondFriendRequestSchema = z.object({
  friendRequestId: z.string(),
  action: z.enum(["accept", "decline"]),
});
export type RespondFriendRequestInput = z.input<typeof respondFriendRequestSchema>;

export const $respondFriendRequest = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(respondFriendRequestSchema)
  .handler(async ({ context, data }) => {
    await context.db.transaction(async (tx) => {
      const [friendRequest] = await tx
        .select()
        .from(friendRequestsTable)
        .where(eq(friendRequestsTable.id, data.friendRequestId))
        .limit(1);

      if (!friendRequest) {
        throw new Error("Friend request not found.");
      }

      if (friendRequest.recipientUserId !== context.userId) {
        throw new Error("Only the recipient can respond to this friend request.");
      }

      if (friendRequest.status !== "pending") {
        throw new Error("This friend request has already been handled.");
      }

      const now = new Date();

      await tx
        .update(friendRequestsTable)
        .set({
          status: data.action === "accept" ? "accepted" : "declined",
          respondedAt: now,
          updatedAt: now,
        })
        .where(eq(friendRequestsTable.id, friendRequest.id));

      if (data.action !== "accept") {
        return;
      }

      const pair = getFriendshipPair(friendRequest.requesterUserId, friendRequest.recipientUserId);
      await tx
        .insert(friendshipsTable)
        .values({
          userAId: pair.userAId,
          userBId: pair.userBId,
          requestedByUserId: friendRequest.requesterUserId,
          acceptedByUserId: friendRequest.recipientUserId,
        })
        .onConflictDoNothing();
    });
  });
