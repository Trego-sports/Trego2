import { notificationsTable } from "@/db/tables";
import { generateId } from "@/lib/id";
import type { DBContext } from "@/lib/middleware/db";
import type { CreateNotificationInput } from "./types";

type NotificationWriteDb = Pick<DBContext, "insert">;

export async function createNotification(db: NotificationWriteDb, input: CreateNotificationInput) {
  const notificationId = generateId("notif");

  await db.insert(notificationsTable).values({
    id: notificationId,
    recipientUserId: input.recipientUserId,
    actorUserId: input.actorUserId ?? null,
    gameId: input.gameId ?? null,
    type: input.type,
    title: input.title,
    body: input.body,
    metadata: input.metadata ?? null,
  });

  return notificationId;
}

export async function createNotifications(db: NotificationWriteDb, inputs: CreateNotificationInput[]) {
  if (inputs.length === 0) {
    return [];
  }

  const notificationIds: string[] = [];
  const values = inputs.map((input) => {
    const notificationId = generateId("notif");
    notificationIds.push(notificationId);

    return {
      id: notificationId,
      recipientUserId: input.recipientUserId,
      actorUserId: input.actorUserId ?? null,
      gameId: input.gameId ?? null,
      type: input.type,
      title: input.title,
      body: input.body,
      metadata: input.metadata ?? null,
    };
  });

  await db.insert(notificationsTable).values(values);

  return notificationIds;
}
