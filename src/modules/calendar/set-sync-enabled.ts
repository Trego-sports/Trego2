import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { userCalendarIntegrationsTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { backfillUpcomingGames } from "./sync";

export const $setCalendarSyncEnabled = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(z.object({ syncEnabled: z.boolean() }))
  .handler(async ({ context, data }) => {
    const updated = await context.db
      .update(userCalendarIntegrationsTable)
      .set({ syncEnabled: data.syncEnabled })
      .where(eq(userCalendarIntegrationsTable.userId, context.userId))
      .returning({ userId: userCalendarIntegrationsTable.userId });

    if (updated.length === 0) {
      throw new Error("Google Calendar is not connected");
    }

    if (data.syncEnabled) {
      await backfillUpcomingGames(context.db, context.userId);
    }
  });
