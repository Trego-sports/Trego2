import { eq, sql } from "drizzle-orm";
import { gameParticipantsTable } from "@/db/tables";
import type { DBContext } from "@/lib/middleware/db";
import type { UserAttendanceStats } from "./types";

type AttendanceStatsDb = Pick<DBContext, "select">;

export async function getUserAttendanceStats(db: AttendanceStatsDb, userId: string): Promise<UserAttendanceStats> {
  const [stats] = await db
    .select({
      presentCount: sql<number>`COUNT(*) FILTER (WHERE ${gameParticipantsTable.attendanceStatus} = 'present')::int`,
      absentCount: sql<number>`COUNT(*) FILTER (WHERE ${gameParticipantsTable.attendanceStatus} = 'absent')::int`,
      markedCount: sql<number>`COUNT(*) FILTER (WHERE ${gameParticipantsTable.attendanceStatus} IN ('present', 'absent'))::int`,
    })
    .from(gameParticipantsTable)
    .where(eq(gameParticipantsTable.userId, userId));

  const presentCount = stats?.presentCount ?? 0;
  const absentCount = stats?.absentCount ?? 0;
  const markedCount = stats?.markedCount ?? 0;
  const attendanceScore = markedCount > 0 ? Math.round((presentCount / markedCount) * 100) : null;

  return {
    userId,
    presentCount,
    absentCount,
    markedCount,
    attendanceScore,
    hasAttendanceHistory: markedCount > 0,
  };
}
