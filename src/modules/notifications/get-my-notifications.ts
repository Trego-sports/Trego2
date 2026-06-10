import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { type NotificationMetadata, type NotificationType, notificationsTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { ensureAttendanceReminders } from "./ensure-attendance-reminders";

export const getMyNotificationsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
});

export interface MyNotification {
  id: string;
  recipientUserId: string;
  actorUserId: string | null;
  gameId: string | null;
  type: NotificationType;
  title: string;
  body: string;
  metadata: NotificationMetadata | null;
  readAt: Date | null;
  acknowledgedAt: Date | null;
  createdAt: Date;
}

export const $getMyNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(getMyNotificationsSchema)
  .handler(async ({ context, data }): Promise<MyNotification[]> => {
    await ensureAttendanceReminders(context.db, context.userId);

    return await context.db
      .select({
        id: notificationsTable.id,
        recipientUserId: notificationsTable.recipientUserId,
        actorUserId: notificationsTable.actorUserId,
        gameId: notificationsTable.gameId,
        type: notificationsTable.type,
        title: notificationsTable.title,
        body: notificationsTable.body,
        metadata: notificationsTable.metadata,
        readAt: notificationsTable.readAt,
        acknowledgedAt: notificationsTable.acknowledgedAt,
        createdAt: notificationsTable.createdAt,
      })
      .from(notificationsTable)
      .where(and(eq(notificationsTable.recipientUserId, context.userId), isNull(notificationsTable.deletedAt)))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(data.limit);
  });
