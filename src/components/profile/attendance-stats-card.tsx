import { ClipboardCheckIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserAttendanceStats } from "@/modules/attendance";

interface AttendanceStatsCardProps {
  stats: UserAttendanceStats;
}

export function AttendanceStatsCard({ stats }: AttendanceStatsCardProps) {
  const attendedText = `${stats.presentCount} of ${stats.markedCount} marked ${
    stats.markedCount === 1 ? "game" : "games"
  } attended`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheckIcon className="h-4 w-4" />
          Attendance
        </CardTitle>
        <CardDescription>Derived from completed games where attendance was marked</CardDescription>
      </CardHeader>
      <CardContent>
        {stats.hasAttendanceHistory && stats.attendanceScore !== null ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Attendance Score</p>
              <p className="text-3xl font-semibold">{stats.attendanceScore}%</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border px-3 py-2">
                <p className="text-xs text-muted-foreground">Present</p>
                <p className="text-lg font-semibold">{stats.presentCount}</p>
              </div>
              <div className="border px-3 py-2">
                <p className="text-xs text-muted-foreground">Absent</p>
                <p className="text-lg font-semibold">{stats.absentCount}</p>
              </div>
              <div className="border px-3 py-2">
                <p className="text-xs text-muted-foreground">Marked</p>
                <p className="text-lg font-semibold">{stats.markedCount}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{attendedText}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No attendance history yet</p>
        )}
      </CardContent>
    </Card>
  );
}
