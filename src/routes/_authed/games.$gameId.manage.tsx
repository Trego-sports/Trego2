import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import { CalendarIcon, ClockIcon, MapPinIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";
import { ManageGameForm } from "@/components/forms/manage-game-form";
import { GameAnnouncementPanel } from "@/components/games/game-announcement-panel";
import { GameLogisticsPanel } from "@/components/games/game-logistics-panel";
import { InvitePlayerPanel } from "@/components/games/invite-player-panel";
import { gameQueries } from "@/modules/games/queries";

export const Route = createFileRoute("/_authed/games/$gameId/manage")({
  component: ManageGamePage,
  errorComponent: ErrorComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(gameQueries.getGame(params.gameId));
    context.queryClient.ensureQueryData(gameQueries.getGameParticipants(params.gameId));
  },
});

function ManageGamePage() {
  const { gameId } = Route.useParams();
  const { data: game } = useSuspenseQuery(gameQueries.getGame(gameId));
  const { data: participants } = useSuspenseQuery(gameQueries.getGameParticipants(gameId));
  const start = game.scheduledAt;
  const end = new Date(game.scheduledAt.getTime() + game.durationMinutes * 60 * 1000);

  return (
    <div className="-mx-4 -mt-6 min-h-[calc(100vh-4rem)] bg-[#f7f9fb] px-4 py-6 text-[#0b1c30] md:-mx-8 md:-mt-8 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-[#38485d]">Manage Game</p>
          <h1 className="line-clamp-2 text-3xl font-black tracking-tight [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif] md:text-4xl">
            {game.title}
          </h1>
        </header>

        <section className="rounded-xl border border-[#d8dadc] bg-white p-5 shadow-sm md:rounded-lg">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px] md:items-center">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#004ac6] px-3 py-1 text-xs font-bold uppercase tracking-[0.06em] text-white">
                  <ShieldCheckIcon className="size-3.5" />
                  Hosted
                </span>
                <span className="rounded-full border border-[#c3c5d9] bg-[#f8f9ff] px-3 py-1 text-xs font-bold uppercase tracking-[0.06em] text-[#434656]">
                  {game.sport}
                </span>
              </div>
              <h2 className="line-clamp-2 text-2xl font-bold [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
                {game.title}
              </h2>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-[#38485d]">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="size-4 text-[#004ac6]" />
                  {start.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="size-4 text-[#004ac6]" />
                  {start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} -{" "}
                  {end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </span>
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <MapPinIcon className="size-4 shrink-0 text-[#004ac6]" />
                  <span className="truncate">{game.locationName}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-[#eff4ff] p-4 text-center">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[#38485d]">Players</p>
                <p className="mt-2 text-3xl font-black text-[#004ac6]">
                  {participants.length}
                  <span className="text-base text-[#38485d]">/{game.spotsTotal}</span>
                </p>
              </div>
              <div className="rounded-lg bg-[#eff4ff] p-4 text-center">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[#38485d]">Duration</p>
                <p className="mt-2 text-3xl font-black text-[#0b1c30]">{game.durationMinutes}</p>
                <p className="text-xs font-semibold text-[#38485d]">minutes</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-6">
            <ManageGameForm gameId={gameId} />
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-[#d8dadc] bg-white p-5 shadow-sm md:rounded-lg">
              <h2 className="text-xl font-bold [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
                Host Tools
              </h2>
              <p className="mt-1 text-sm text-[#434656]">Invite, message, and manage your roster.</p>
              <div className="mt-4 grid gap-3">
                <a
                  href="#invite-players"
                  className="flex items-center gap-3 rounded-lg border border-[#c3c5d9] bg-[#f8f9ff] p-4 text-sm font-bold text-[#0b1c30] transition hover:border-[#004ac6] hover:bg-[#eff4ff]"
                >
                  <UsersIcon className="size-5" />
                  <span>Invite Players</span>
                </a>
                <a
                  href="#announcements"
                  className="flex items-center gap-3 rounded-lg border border-[#c3c5d9] bg-[#f8f9ff] p-4 text-sm font-bold text-[#0b1c30] transition hover:border-[#004ac6] hover:bg-[#eff4ff]"
                >
                  <ShieldCheckIcon className="size-5" />
                  <span>Send Announcement</span>
                </a>
                <a
                  href="#logistics"
                  className="flex items-center gap-3 rounded-lg border border-[#c3c5d9] bg-[#f8f9ff] p-4 text-sm font-bold text-[#0b1c30] transition hover:border-[#004ac6] hover:bg-[#eff4ff]"
                >
                  <MapPinIcon className="size-5" />
                  <span>Roster Logistics</span>
                </a>
              </div>
            </section>

            <div id="invite-players">
              <InvitePlayerPanel gameId={gameId} />
            </div>
            <div id="announcements">
              <GameAnnouncementPanel gameId={gameId} />
            </div>
            <div id="logistics">
              <GameLogisticsPanel gameId={gameId} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
