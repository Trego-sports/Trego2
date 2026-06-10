import { createServerFn } from "@tanstack/react-start";
import { and, eq, isNull, sql } from "drizzle-orm";
import { notificationsTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { ensureAttendanceReminders } from "./ensure-attendance-reminders";

export const $getUnreadNotificationCount = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .handler(async ({ context }) => {
    await ensureAttendanceReminders(context.db, context.userId);

    const [result] = await context.db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(notificationsTable)
      .where(
        and(
          eq(notificationsTable.recipientUserId, context.userId),
          isNull(notificationsTable.readAt),
          isNull(notificationsTable.deletedAt),
        ),
      );

    return result?.count ?? 0;
  });
