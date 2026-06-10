import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";
import { notificationsTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const $deleteMultipleNotifications = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(z.object({ notificationIds: z.array(z.string()).min(1).max(100) }))
  .handler(async ({ context, data }) => {
    await context.db
      .update(notificationsTable)
      .set({ deletedAt: new Date() })
      .where(
        and(
          inArray(notificationsTable.id, data.notificationIds),
          eq(notificationsTable.recipientUserId, context.userId),
          isNull(notificationsTable.deletedAt),
        ),
      );
  });
