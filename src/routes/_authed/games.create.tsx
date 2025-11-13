import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import { CreateGameForm } from "@/components/forms/create-game-form";

export const Route = createFileRoute("/_authed/games/create")({
  component: CreateGamePage,
  errorComponent: ErrorComponent,
});

function CreateGamePage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create a Game</h1>
        <p className="text-muted-foreground text-sm mt-1.5">Post a pickup game and find players to join</p>
      </div>
      <CreateGameForm />
    </div>
  );
}
