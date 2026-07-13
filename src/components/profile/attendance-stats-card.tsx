import { ClipboardCheckIcon } from "lucide-react";
import type { UserAttendanceStats } from "@/modules/attendance";

interface AttendanceStatsCardProps {
  stats: UserAttendanceStats;
}

export function AttendanceStatsCard({ stats }: AttendanceStatsCardProps) {
  const score = stats.attendanceScore ?? 0;
  const attendedText = `${stats.presentCount} of ${stats.markedCount} marked ${
    stats.markedCount === 1 ? "game" : "games"
  } attended`;

  return (
    <section className="rounded-lg border border-[#c3c6d7] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
            <ClipboardCheckIcon className="size-5 text-[#004ac6]" />
            Attendance Reliability
          </h2>
          <p className="mt-1 text-sm font-medium text-[#647086]">
            {stats.hasAttendanceHistory ? attendedText : "No completed attendance marks yet."}
          </p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black leading-none text-[#004ac6] tabular-nums">{score}%</p>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.08em] text-[#38485d]">Score</p>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#d8dee8]">
        <div className="h-full rounded-full bg-[#004ac6]" style={{ width: `${Math.min(score, 100)}%` }} />
      </div>

      <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-lg border border-[#d8def0] bg-[#f8f9ff]">
        <Stat label="Present" value={stats.presentCount} tone="blue" />
        <Stat label="Absent" value={stats.absentCount} tone="red" />
        <Stat label="Marked" value={stats.markedCount} tone="dark" />
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "blue" | "red" | "dark" }) {
  const color = tone === "blue" ? "text-[#004ac6]" : tone === "red" ? "text-[#b91c1c]" : "text-[#0b1c30]";

  return (
    <div className="border-r border-[#d8def0] p-3 last:border-r-0">
      <p className="text-xs font-bold text-[#647086]">{label}</p>
      <p className={`mt-1 text-2xl font-black tabular-nums ${color}`}>{value}</p>
    </div>
  );
}
