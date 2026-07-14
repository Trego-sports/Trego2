import { createFileRoute, ErrorComponent, Link } from "@tanstack/react-router";
import { XIcon } from "lucide-react";
import { CreateGameForm } from "@/components/forms/create-game-form";

export const Route = createFileRoute("/_authed/games/create")({
  component: CreateGamePage,
  errorComponent: ErrorComponent,
});

function CreateGamePage() {
  return (
    <div className="-mx-4 -mt-6 min-h-[calc(100vh-4rem)] bg-[#f7f9fb] px-4 py-8 text-[#0b1c30] md:-mx-8 md:-mt-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#004ac6]">Host setup</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif] md:text-4xl">
              Create New Game
            </h1>
            <p className="mt-2 text-sm text-[#434656]">Set the details, schedule, and location for your game.</p>
          </div>
          <Link
            to="/dashboard"
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#38485d] transition hover:bg-[#eff4ff] md:inline-flex"
          >
            <XIcon className="size-4" />
            Exit Creation
          </Link>
        </div>

        <CreateGameForm />
      </div>
    </div>
  );
}
