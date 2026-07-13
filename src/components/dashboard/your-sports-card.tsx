import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  CalendarIcon,
  ClipboardCheckIcon,
  DumbbellIcon,
  EyeIcon,
  HistoryIcon,
  MapPinIcon,
  TrophyIcon,
} from "lucide-react";
import type { AttendanceStatus } from "@/db/tables";
import { gameQueries } from "@/modules/games/queries";
import { userQueries } from "@/modules/profile/queries";

export function YourPastGamesCard() {
  const { data: pastGames } = useSuspenseQuery(gameQueries.getPastGames());

  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold leading-8 text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
        Past Games
      </h2>

      {pastGames.length > 0 ? (
        <div className="space-y-3 rounded-lg border border-[#c3c6d7] bg-white p-4 shadow-sm">
          {pastGames.slice(0, 4).map((game) => {
            const isFinalized = game.attendanceFinalizedAt !== null;
            const AttendanceIcon = isFinalized ? EyeIcon : ClipboardCheckIcon;

            return (
              <div key={game.id} className="border-b border-[#e5eeff] pb-3 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-[#0b1c30]">{game.title}</h3>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#434655]">
                      <span>{game.sport}</span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarIcon className="size-3" />
                        {formatPastDate(game.scheduledAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPinIcon className="size-3" />
                        {game.locationName}
                      </span>
                    </div>
                    {!game.isHost ? (
                      <div className="mt-2">
                        <AttendanceStatusPill status={isFinalized ? game.attendanceStatus : null} />
                      </div>
                    ) : null}
                  </div>

                  {game.isHost ? (
                    <Link
                      to="/games/$gameId/attendance"
                      params={{ gameId: game.id }}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#c3c6d7] px-3 py-2 text-xs font-semibold text-[#004ac6] transition hover:bg-[#eff4ff]"
                    >
                      <AttendanceIcon className="size-3.5" />
                      {isFinalized ? "View" : "Mark"}
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-[#c3c6d7] bg-white p-8 text-center shadow-sm">
          <HistoryIcon className="mb-4 size-10 text-[#c3c6d7]" />
          <h3 className="text-lg font-bold text-[#0b1c30]">No past games</h3>
          <p className="mt-1 text-sm text-[#434655]">Your game history will appear here.</p>
        </div>
      )}
    </section>
  );
}

export function YourSportsCard() {
  const { data: profile } = useSuspenseQuery(userQueries.getMyProfile());
  const sports = profile.playerSports;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold leading-8 text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
          My Sports
        </h2>
        <Link to="/profile" className="text-sm font-semibold text-[#004ac6]">
          Edit
        </Link>
      </div>

      {sports.length > 0 ? (
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#e5eeff] md:rounded-lg md:border md:border-[#c3c6d7] md:ring-0">
          <div className="grid gap-3">
            {sports.map((sport) => (
              <div
                key={`${sport.sport}-${sport.position ?? ""}`}
                className="flex items-center gap-3 rounded-lg border border-[#e5eeff] bg-[#f8f9ff] p-3"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e5eeff] text-[#004ac6]">
                  <TrophyIcon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-[#0b1c30]">{sport.sport}</h3>
                  <p className="mt-0.5 text-xs text-[#434655]">
                    {sport.skillLevel}
                    {sport.position ? ` • ${sport.position}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-[#e5eeff] md:rounded-lg md:border md:border-[#c3c6d7] md:ring-0">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#e5eeff] text-[#004ac6]">
            <DumbbellIcon className="size-8" />
          </div>
          <h3 className="mt-5 text-base font-bold text-[#0b1c30]">No sports added yet</h3>
          <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-[#434655]">
            Add the sports you play to get personalized game recommendations and invites.
          </p>
          <Link
            to="/profile"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-[#004ac6] px-5 text-sm font-semibold text-[#004ac6]"
          >
            Add Sports
          </Link>
        </div>
      )}
    </section>
  );
}

function AttendanceStatusPill({ status }: { status: AttendanceStatus | null }) {
  const label = status === "present" ? "Present" : status === "absent" ? "Not present" : "No info";
  const className =
    status === "present"
      ? "border-[#1b7f3a]/30 bg-[#1b7f3a]/10 text-[#1b7f3a]"
      : status === "absent"
        ? "border-[#ba1a1a]/30 bg-[#ba1a1a]/10 text-[#ba1a1a]"
        : "border-[#c3c6d7] bg-[#eff4ff] text-[#434655]";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>{label}</span>
  );
}

function formatPastDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
