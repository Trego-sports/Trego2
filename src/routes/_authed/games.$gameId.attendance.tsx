import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import { CalendarIcon, MapPinIcon, ShieldCheckIcon } from "lucide-react";
import { AttendanceMarkingPanel } from "@/components/games/attendance-marking-panel";
import { gameQueries } from "@/modules/games/queries";

export const Route = createFileRoute("/_authed/games/$gameId/attendance")({
  component: GameAttendancePage,
  errorComponent: ErrorComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(gameQueries.getGame(params.gameId));
    context.queryClient.ensureQueryData(gameQueries.getGameParticipants(params.gameId));
  },
});

function GameAttendancePage() {
  const { gameId } = Route.useParams();
  const { data: game } = useSuspenseQuery(gameQueries.getGame(gameId));
  const isFinalized = game.attendanceFinalizedAt !== null;
  const startDate = game.scheduledAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const startTime = game.scheduledAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <div className="-mx-4 -mt-8 min-h-[calc(100vh-4rem)] bg-[#f7f9fb] px-4 py-8 text-[#0b1c30] md:-mx-8 md:-mt-10 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-lg border border-[#c3c6d7] bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#004ac6] px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-white">
                  {game.sport}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#e5eeff] px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[#38485d]">
                  <ShieldCheckIcon className="size-3.5" />
                  {isFinalized ? "Finalized" : "Hosted"}
                </span>
              </div>
              <h1 className="line-clamp-2 text-3xl font-black tracking-tight text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif] md:text-4xl">
                {game.title}
              </h1>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#38485d]">
                <span className="inline-flex items-center gap-2">
                  <CalendarIcon className="size-4 text-[#004ac6]" />
                  {startDate} at {startTime}
                </span>
                <span className="inline-flex min-w-0 items-center gap-2">
                  <MapPinIcon className="size-4 shrink-0 text-[#004ac6]" />
                  <span className="truncate">{game.locationName}</span>
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-[#d8def0] bg-[#f8f9ff] px-5 py-4">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-[#647086]">
                {isFinalized ? "Attendance complete" : "Attendance pending"}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#38485d]">
                {isFinalized ? "Results are locked for this game." : "Record who showed up before closing the roster."}
              </p>
            </div>
          </div>
        </section>

        <AttendanceMarkingPanel gameId={gameId} />
      </div>
    </div>
  );
}
