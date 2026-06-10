import { createServerFn } from "@tanstack/react-start";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { notificationsTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const notificationIdSchema = z.object({
  notificationId: z.string(),
});
export type NotificationIdInput = z.input<typeof notificationIdSchema>;

export const $markNotificationRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(notificationIdSchema)
  .handler(async ({ context, data }) => {
    await context.db
      .update(notificationsTable)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notificationsTable.id, data.notificationId),
          eq(notificationsTable.recipientUserId, context.userId),
          isNull(notificationsTable.deletedAt),
        ),
      );
  });
