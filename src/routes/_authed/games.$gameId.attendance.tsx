import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
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

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{isFinalized ? "View Attendance" : "Mark Attendance"}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {isFinalized ? "Review the submitted attendance result." : "Record who showed up for this completed game."}
        </p>
      </div>
      <AttendanceMarkingPanel gameId={gameId} />
    </div>
  );
}
