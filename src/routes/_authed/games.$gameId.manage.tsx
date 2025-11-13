import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import { ManageGameForm } from "@/components/forms/manage-game-form";
import { gameQueries } from "@/modules/games/queries";

export const Route = createFileRoute("/_authed/games/$gameId/manage")({
  component: ManageGamePage,
  errorComponent: ErrorComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(gameQueries.getGame(params.gameId));
  },
});

function ManageGamePage() {
  const { gameId } = Route.useParams();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Manage Game</h1>
        <p className="text-muted-foreground text-sm mt-1.5">Update your game details</p>
      </div>
      <ManageGameForm gameId={gameId} />
    </div>
  );
}
