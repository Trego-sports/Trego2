import { createServerFn } from "@tanstack/react-start";
import { and, eq, isNull } from "drizzle-orm";
import { notificationsTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { notificationIdSchema } from "./mark-notification-read";

export const $deleteNotification = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(notificationIdSchema)
  .handler(async ({ context, data }) => {
    await context.db
      .update(notificationsTable)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(notificationsTable.id, data.notificationId),
          eq(notificationsTable.recipientUserId, context.userId),
          isNull(notificationsTable.deletedAt),
        ),
      );
  });
