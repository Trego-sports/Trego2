import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CalendarXIcon, ChevronRightIcon } from "lucide-react";
import { gameQueries } from "@/modules/games/queries";
import type { DashboardGame } from "@/modules/games/types";
import { GameCompactListItem, getGameStatus } from "./game-card-system";

export function UpcomingGamesCard() {
  const { data: upcomingGames } = useSuspenseQuery(gameQueries.getUpcomingGames());
  const upcomingMatches = upcomingGames.slice(1, 4);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold leading-8 text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
          Upcoming Games
        </h2>
        {upcomingMatches.length > 0 ? (
          <Link to="/dashboard" className="text-sm font-semibold text-[#004ac6] md:hidden">
            View Calendar
          </Link>
        ) : null}
      </div>

      {upcomingMatches.length > 0 ? (
        <div className="space-y-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-[#e5eeff] md:rounded-lg md:border md:border-[#c3c5d9] md:p-4 md:ring-0">
          {upcomingMatches.map((game) => (
            <UpcomingGameRow key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-[#c3c5d9] bg-white p-8 text-center shadow-sm">
          <CalendarXIcon className="mb-4 size-10 text-[#c3c5d9]" />
          <h3 className="text-lg font-bold text-[#0b1c30]">No upcoming matches</h3>
          <p className="mt-1 text-sm text-[#434656]">You haven't joined any future games yet.</p>
        </div>
      )}
    </section>
  );
}

function UpcomingGameRow({ game }: { game: DashboardGame }) {
  return (
    <GameCompactListItem
      game={game}
      status={getGameStatus(game, true)}
      action={<ChevronRightIcon className="size-4 shrink-0 text-[#434656]" />}
    />
  );
}
