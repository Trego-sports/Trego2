import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CalendarIcon, ClipboardCheckIcon, EyeIcon, HistoryIcon, MapPinIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AttendanceStatus } from "@/db/tables";
import { gameQueries } from "@/modules/games/queries";

function AttendanceStatusPill({ status }: { status: AttendanceStatus | null }) {
  const label = status === "present" ? "Present" : status === "absent" ? "Not present" : "No info";
  const className =
    status === "present"
      ? "border-green-700/30 bg-green-700/10 text-green-800"
      : status === "absent"
        ? "border-red-700/30 bg-red-700/10 text-red-800"
        : "border-muted-foreground/30 bg-muted text-muted-foreground";

  return <span className={`inline-flex border px-2 py-1 text-xs font-medium ${className}`}>{label}</span>;
}

export function YourPastGamesCard() {
  const { data: pastGames } = useSuspenseQuery(gameQueries.getPastGames());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HistoryIcon className="h-4 w-4" />
          Your Past Games
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pastGames.length > 0 ? (
            pastGames.map((game) => {
              const isFinalized = game.attendanceFinalizedAt !== null;
              const AttendanceIcon = isFinalized ? EyeIcon : ClipboardCheckIcon;

              return (
                <div key={game.id} className="space-y-2 border-b py-3 last:border-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{game.title}</div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{game.sport}</span>
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {game.scheduledAt.toLocaleDateString()}{" "}
                          {game.scheduledAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="h-3 w-3" />
                          {game.locationName}
                        </span>
                      </div>
                      {!game.isHost && (
                        <div className="mt-2">
                          <AttendanceStatusPill status={isFinalized ? game.attendanceStatus : null} />
                        </div>
                      )}
                    </div>

                    {game.isHost && (
                      <Link
                        to="/games/$gameId/attendance"
                        params={{ gameId: game.id }}
                        className="inline-flex shrink-0 items-center gap-1 border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                      >
                        <AttendanceIcon className="h-3.5 w-3.5" />
                        {isFinalized ? "View Attendance" : "Mark Attendance"}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground py-2">No past games yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
