import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { userCalendarIntegrationsTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";

export const $getCalendarStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .handler(async ({ context }) => {
    const integration = await context.db.query.userCalendarIntegrationsTable.findFirst({
      columns: {
        syncEnabled: true,
        lastSyncError: true,
        connectedAt: true,
      },
      where: eq(userCalendarIntegrationsTable.userId, context.userId),
    });

    return {
      connected: !!integration,
      syncEnabled: integration?.syncEnabled ?? false,
      lastSyncError: integration?.lastSyncError ?? null,
      connectedAt: integration?.connectedAt ?? null,
    };
  });
