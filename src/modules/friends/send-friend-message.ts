import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { friendMessagesTable, friendshipsTable } from "@/db/tables";
import { generateId } from "@/lib/id";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { getFriendshipPair } from "./utils";

export const sendFriendMessageSchema = z.object({
  friendUserId: z.string(),
  body: z.string().trim().min(1, "Message cannot be empty.").max(2000, "Message must be 2000 characters or less."),
});
export type SendFriendMessageInput = z.input<typeof sendFriendMessageSchema>;

export const $sendFriendMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(sendFriendMessageSchema)
  .handler(async ({ context, data }) => {
    if (data.friendUserId === context.userId) {
      throw new Error("You cannot chat with yourself.");
    }

    const pair = getFriendshipPair(context.userId, data.friendUserId);

    const [friendship] = await context.db
      .select({ userAId: friendshipsTable.userAId })
      .from(friendshipsTable)
      .where(and(eq(friendshipsTable.userAId, pair.userAId), eq(friendshipsTable.userBId, pair.userBId)))
      .limit(1);

    if (!friendship) {
      throw new Error("You can only message accepted friends.");
    }

    await context.db.insert(friendMessagesTable).values({
      id: generateId("friend_msg"),
      userAId: pair.userAId,
      userBId: pair.userBId,
      senderUserId: context.userId,
      body: data.body,
    });
  });
