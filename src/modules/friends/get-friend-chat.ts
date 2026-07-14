import { createServerFn } from "@tanstack/react-start";
import { and, asc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { friendMessagesTable, friendshipsTable, usersTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { getFriendshipPair } from "./utils";

export const getFriendChatSchema = z.object({
  friendUserId: z.string(),
});
export type GetFriendChatInput = z.input<typeof getFriendChatSchema>;

export const $getFriendChat = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(getFriendChatSchema)
  .handler(async ({ context, data }) => {
    if (data.friendUserId === context.userId) {
      throw new Error("You cannot chat with yourself.");
    }

    return await context.db.transaction(async (tx) => {
      const pair = getFriendshipPair(context.userId, data.friendUserId);

      const [friendship] = await tx
        .select({ createdAt: friendshipsTable.createdAt })
        .from(friendshipsTable)
        .where(and(eq(friendshipsTable.userAId, pair.userAId), eq(friendshipsTable.userBId, pair.userBId)))
        .limit(1);

      if (!friendship) {
        throw new Error("You can only chat with accepted friends.");
      }

      const [friend] = await tx
        .select({
          userId: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          profilePictureUrl: usersTable.profilePictureUrl,
        })
        .from(usersTable)
        .where(eq(usersTable.id, data.friendUserId))
        .limit(1);

      if (!friend) {
        throw new Error("Friend not found.");
      }

      await tx
        .update(friendMessagesTable)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(friendMessagesTable.userAId, pair.userAId),
            eq(friendMessagesTable.userBId, pair.userBId),
            eq(friendMessagesTable.senderUserId, data.friendUserId),
            isNull(friendMessagesTable.readAt),
          ),
        );

      const messages = await tx
        .select({
          id: friendMessagesTable.id,
          senderUserId: friendMessagesTable.senderUserId,
          senderName: usersTable.name,
          body: friendMessagesTable.body,
          readAt: friendMessagesTable.readAt,
          createdAt: friendMessagesTable.createdAt,
        })
        .from(friendMessagesTable)
        .innerJoin(usersTable, eq(friendMessagesTable.senderUserId, usersTable.id))
        .where(and(eq(friendMessagesTable.userAId, pair.userAId), eq(friendMessagesTable.userBId, pair.userBId)))
        .orderBy(asc(friendMessagesTable.createdAt));

      return {
        friend,
        friendshipCreatedAt: friendship.createdAt,
        messages: messages.map((message) => ({
          ...message,
          isMine: message.senderUserId === context.userId,
        })),
      };
    });
  });
