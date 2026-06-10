import { createServerFn } from "@tanstack/react-start";
import { and, eq, isNull } from "drizzle-orm";
import { notificationsTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const $markAllNotificationsRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .handler(async ({ context }) => {
    await context.db
      .update(notificationsTable)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notificationsTable.recipientUserId, context.userId),
          isNull(notificationsTable.readAt),
          isNull(notificationsTable.deletedAt),
        ),
      );
  });
