import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { friendRequestsTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const cancelFriendRequestSchema = z.object({
  friendRequestId: z.string(),
});
export type CancelFriendRequestInput = z.input<typeof cancelFriendRequestSchema>;

export const $cancelFriendRequest = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(cancelFriendRequestSchema)
  .handler(async ({ context, data }) => {
    const [friendRequest] = await context.db
      .select()
      .from(friendRequestsTable)
      .where(eq(friendRequestsTable.id, data.friendRequestId))
      .limit(1);

    if (!friendRequest) {
      throw new Error("Friend request not found.");
    }

    if (friendRequest.requesterUserId !== context.userId) {
      throw new Error("Only the requester can cancel this friend request.");
    }

    if (friendRequest.status !== "pending") {
      throw new Error("This friend request has already been handled.");
    }

    await context.db
      .update(friendRequestsTable)
      .set({
        status: "cancelled",
        respondedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(friendRequestsTable.id, friendRequest.id));
  });
