import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRightIcon, SearchIcon } from "lucide-react";
import { useJoinGame } from "@/modules/games/mutations";
import { gameQueries } from "@/modules/games/queries";
import type { DashboardGame } from "@/modules/games/types";
import { GameActionButton, GameStandardCard, getGameStatus } from "./game-card-system";

const FEATURED_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC-k7wpm5-nhOriInoMDHTHutdY9ru0FHArgV0RM4bc5SMlum6gz8yWWR6bAF9MAZ13QSzEBy_ri7J1Om2PcE4tX8pK4SBzDpIqp9RPBA16TcKI1aOH0n7dFRVRfqXcc0pFc-bZtcET1SSaDhnUELzxUGKN89wiQQ95mO0DcmSAsrtY82a5U_wua0wSgU7icpZ2ak7G7dCgPW5SQR3WaVumyAHVznIa4noASIyrzDSPlA5wiFd8ezb3m5xmq84_Y6bgOc4iM_yREIM";

export function RecommendedGamesCard() {
  const joinMutation = useJoinGame();
  const { data: recommendedGames } = useSuspenseQuery(gameQueries.getRecommendedGames());
  const visibleGames = recommendedGames.slice(0, 2);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold leading-8 text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
          Recommended for You
        </h2>
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-[#004ac6] md:hidden">
          View All
          <ChevronRightIcon className="size-4" />
        </Link>
      </div>

      {visibleGames.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {visibleGames.map((game, index) => (
            <RecommendationCard
              key={game.id}
              game={game}
              featuredImage={index === 0 ? FEATURED_IMAGE : undefined}
              isJoining={joinMutation.isPending && joinMutation.variables === game.id}
              onJoin={() => joinMutation.mutate(game.id)}
            />
          ))}
          <DirectoryCard />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[#c3c5d9] bg-white/70 p-8 text-center">
          <SearchIcon className="mx-auto mb-3 size-9 text-[#737688]" />
          <h3 className="text-lg font-bold text-[#0b1c30]">No matches yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[#434656]">
            Add sports and location details to unlock personalized games nearby.
          </p>
          <Link
            to="/profile"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-[#004ac6] px-4 text-sm font-semibold text-[#004ac6]"
          >
            Update Profile
          </Link>
        </div>
      )}
    </section>
  );
}

function RecommendationCard({
  game,
  featuredImage,
  isJoining,
  onJoin,
}: {
  game: DashboardGame;
  featuredImage?: string;
  isJoining: boolean;
  onJoin: () => void;
}) {
  const status = getGameStatus(game);
  const isFull = status === "full";

  return (
    <GameStandardCard
      game={game}
      status={status}
      featuredImage={featuredImage}
      actions={
        <GameActionButton
          variant={isFull ? "secondary" : featuredImage ? "primary" : "utility"}
          disabled={isFull || isJoining}
          onClick={onJoin}
          className="w-full"
        >
          {isJoining ? "Joining..." : isFull ? "Full" : featuredImage ? "Join Game" : "Join"}
        </GameActionButton>
      }
    />
  );
}

function DirectoryCard() {
  return (
    <Link
      to="/dashboard"
      className="hidden min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-[#c3c5d9] bg-white/50 p-6 text-center transition hover:border-[#004ac6] hover:bg-white md:flex"
    >
      <SearchIcon className="mb-4 size-9 text-[#737688]" />
      <h3 className="text-lg font-bold tracking-[0.08em] text-[#0b1c30]">Find More Games</h3>
      <p className="mt-1 text-sm text-[#434656]">Browse all upcoming matches</p>
      <span className="mt-5 text-sm font-semibold text-[#004ac6]">View Directory</span>
    </Link>
  );
}
