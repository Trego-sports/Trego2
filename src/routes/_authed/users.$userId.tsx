import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import {
  CalendarIcon,
  ClipboardCheckIcon,
  HistoryIcon,
  MapPinIcon,
  ShieldCheckIcon,
  TrophyIcon,
  UserIcon,
} from "lucide-react";
import { GameCompactListItem } from "@/components/dashboard/game-card-system";
import { AttendanceStatsCard } from "@/components/profile/attendance-stats-card";
import { userQueries } from "@/modules/profile/queries";

export const Route = createFileRoute("/_authed/users/$userId")({
  component: UserViewPage,
  errorComponent: ErrorComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(userQueries.getUserProfile(params.userId));
  },
});

function UserViewPage() {
  const { userId } = Route.useParams();
  const { data: profile } = useSuspenseQuery(userQueries.getUserProfile(userId));
  const attendanceScore = profile.attendanceStats.attendanceScore ?? 0;
  const games = profile.games ?? [];
  const now = new Date();
  const upcomingCount = games.filter((game) => game.scheduledAt >= now).length;
  const hostedCount = games.filter((game) => game.isHost).length;

  return (
    <div className="-mx-4 -mt-8 min-h-[calc(100vh-4rem)] bg-[#f7f9fb] px-4 py-8 text-[#0b1c30] md:-mx-8 md:-mt-10 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <p className="text-sm font-black uppercase tracking-[0.08em] text-[#004ac6]">Player profile</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
            {profile.name}
          </h1>
        </header>

        <section className="overflow-hidden rounded-lg border border-[#c3c6d7] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
          <div className="h-28 bg-[#004ac6]" />
          <div className="grid gap-6 p-6 pt-0 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="-mt-14 flex flex-col gap-5 md:flex-row md:items-end">
              <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#dce9ff] text-4xl font-black text-[#004ac6] shadow-[0_10px_30px_rgba(15,23,42,0.16)] outline outline-4 outline-white">
                {profile.profilePictureUrl ? (
                  <img src={profile.profilePictureUrl} alt={profile.name} className="size-full object-cover" />
                ) : (
                  initials(profile.name)
                )}
              </div>
              <div className="min-w-0 pb-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e5eeff] px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[#004ac6]">
                    <ShieldCheckIcon className="size-3.5" />
                    Verified Player
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#f8f9ff] px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[#38485d]">
                    <ClipboardCheckIcon className="size-3.5" />
                    {attendanceScore}% Reliability
                  </span>
                </div>
                <h2 className="truncate text-3xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
                  {profile.name}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#647086]">
                  <MapPinIcon className="size-4" />
                  Local Trego player
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:pt-6">
              <ProfileStat label="Games" value={games.length} />
              <ProfileStat label="Upcoming" value={upcomingCount} />
              <ProfileStat label="Hosted" value={hostedCount} />
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <AttendanceStatsCard stats={profile.attendanceStats} />

            <section className="rounded-lg border border-[#c3c6d7] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
              <h2 className="flex items-center gap-2 text-xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
                <TrophyIcon className="size-5 text-[#004ac6]" />
                Sports
              </h2>
              <div className="mt-4 grid gap-3">
                {profile.sports.length > 0 ? (
                  profile.sports.map((sport) => (
                    <div
                      key={`${sport.sport}-${sport.skillLevel}-${sport.position ?? ""}`}
                      className="rounded-lg border border-[#d8def0] bg-[#f8f9ff] p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-black text-[#0b1c30]">{sport.sport}</p>
                          {sport.position && (
                            <p className="mt-1 text-sm font-medium text-[#647086]">{sport.position}</p>
                          )}
                        </div>
                        <span className="rounded-md bg-[#e5eeff] px-2.5 py-1 text-xs font-black uppercase tracking-[0.08em] text-[#004ac6]">
                          {sport.skillLevel}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-[#c3c6d7] bg-[#f8f9ff] p-5 text-center">
                    <TrophyIcon className="mx-auto size-8 text-[#c3c6d7]" />
                    <p className="mt-2 text-sm font-bold text-[#647086]">No sports listed yet</p>
                  </div>
                )}
              </div>
            </section>
          </aside>

          <main className="space-y-6">
            <section className="rounded-lg border border-[#c3c6d7] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
                    <HistoryIcon className="size-6 text-[#004ac6]" />
                    Game History
                  </h2>
                  <p className="mt-1 text-sm font-medium text-[#647086]">Games this player has joined or hosted.</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-lg border border-[#d8def0] bg-[#f8f9ff] px-3 py-2 text-sm font-black text-[#38485d]">
                  <CalendarIcon className="size-4 text-[#004ac6]" />
                  {games.length} total
                </span>
              </div>

              {games.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {games.map((game) => (
                    <GameCompactListItem key={game.id} game={game} status="joined" />
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-dashed border-[#c3c6d7] bg-[#f8f9ff] p-8 text-center">
                  <UserIcon className="mx-auto size-10 text-[#c3c6d7]" />
                  <p className="mt-3 font-black text-[#0b1c30]">No games yet</p>
                  <p className="mt-1 text-sm font-medium text-[#647086]">Joined and hosted games will appear here.</p>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#d8def0] bg-[#f8f9ff] p-4 text-center">
      <p className="text-3xl font-black text-[#004ac6] tabular-nums">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.08em] text-[#647086]">{label}</p>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
