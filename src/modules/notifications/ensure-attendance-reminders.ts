import { and, eq, isNull, sql } from "drizzle-orm";
import { gamesTable, notificationsTable } from "@/db/tables";
import type { DBContext } from "@/lib/middleware/db";
import { createNotifications } from "./utils";

export async function ensureAttendanceReminders(db: DBContext, hostUserId: string) {
  const now = new Date();

  const endedGames = await db
    .select({
      id: gamesTable.id,
      title: gamesTable.title,
      sport: gamesTable.sport,
      locationName: gamesTable.locationName,
      scheduledAt: gamesTable.scheduledAt,
    })
    .from(gamesTable)
    .where(
      and(
        eq(gamesTable.hostId, hostUserId),
        isNull(gamesTable.attendanceFinalizedAt),
        sql`${gamesTable.scheduledAt} + (${gamesTable.durationMinutes} || ' minutes')::interval < ${now}`,
      ),
    );

  if (endedGames.length === 0) {
    return;
  }

  const existingReminders = await db
    .select({ gameId: notificationsTable.gameId })
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.recipientUserId, hostUserId),
        eq(notificationsTable.type, "attendance_mark_reminder"),
        isNull(notificationsTable.deletedAt),
      ),
    );

  const remindedGameIds = new Set(existingReminders.map((reminder) => reminder.gameId).filter(Boolean));
  const gamesNeedingReminder = endedGames.filter((game) => !remindedGameIds.has(game.id));

  if (gamesNeedingReminder.length === 0) {
    return;
  }

  await createNotifications(
    db,
    gamesNeedingReminder.map((game) => ({
      recipientUserId: hostUserId,
      gameId: game.id,
      type: "attendance_mark_reminder",
      title: "Submit attendance",
      body: `"${game.title}" has ended. Submit attendance for your players.`,
      metadata: {
        gameTitle: game.title,
        sport: game.sport,
        locationName: game.locationName,
        scheduledAt: game.scheduledAt.toISOString(),
      },
    })),
  );
}
