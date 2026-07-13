import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CalendarIcon, ClockIcon, NavigationIcon, PlusCircleIcon, SettingsIcon, UserMinusIcon } from "lucide-react";
import { useState } from "react";
import { buildGoogleCalendarTemplateUrl } from "@/modules/calendar/build-google-template-url";
import { calendarQueries } from "@/modules/calendar/queries";
import { useLeaveGame } from "@/modules/games/mutations";
import { gameQueries } from "@/modules/games/queries";
import type { DashboardGame } from "@/modules/games/types";
import { GameActionButton, GameFeaturedCard, getGameStatus } from "./game-card-system";
import { ViewPlayersDialog } from "./view-players-dialog";

export function NextGameCard() {
  const leaveMutation = useLeaveGame();
  const [showPlayersDialog, setShowPlayersDialog] = useState(false);
  const { data: upcomingGames } = useSuspenseQuery(gameQueries.getUpcomingGames());
  const { data: calendarStatus } = useSuspenseQuery(calendarQueries.getStatus());
  const nextGame = upcomingGames?.[0];

  if (!nextGame) {
    return (
      <section>
        <SectionTitle>Next Game</SectionTitle>
        <div className="rounded-lg border border-[#c3c5d9] bg-white p-8 text-center shadow-sm">
          <ClockIcon className="mx-auto mb-3 size-10 text-[#c3c5d9]" />
          <h2 className="text-lg font-bold text-[#0b1c30]">No upcoming match</h2>
          <p className="mt-1 text-sm text-[#434656]">Join a game or create one to get your next action ready.</p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/games/create"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-4 text-sm font-semibold text-white"
            >
              <PlusCircleIcon className="size-4" />
              Create Game
            </Link>
            <Link
              to="/profile"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#c3c5d9] px-4 text-sm font-semibold text-[#004ac6]"
            >
              Tune Recommendations
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const handleAddToCalendar = () => {
    window.open(
      buildGoogleCalendarTemplateUrl({
        id: nextGame.id,
        sport: nextGame.sport,
        title: nextGame.title,
        locationName: nextGame.locationName,
        location: nextGame.location,
        scheduledAt: nextGame.scheduledAt,
        durationMinutes: nextGame.durationMinutes,
        allowedSkillLevels: nextGame.skillLevels,
      }),
      "_blank",
    );
  };

  const handleGetDirections = () => {
    const mapsUrl = new URL("https://www.google.com/maps/dir/");
    mapsUrl.searchParams.set("api", "1");
    mapsUrl.searchParams.set("destination", `${nextGame.location.lat},${nextGame.location.lon}`);
    window.open(mapsUrl.toString(), "_blank");
  };

  const isLeaving = leaveMutation.isPending && leaveMutation.variables === nextGame.id;

  return (
    <>
      <section>
        <SectionTitle>Next Game</SectionTitle>
        <GameFeaturedCard
          game={nextGame}
          status={getGameStatus(nextGame, true)}
          countdown={formatCountdown(nextGame)}
          calendarNote={calendarStatus.connected && calendarStatus.syncEnabled ? "Synced to Google Calendar" : null}
          onViewPlayers={() => setShowPlayersDialog(true)}
          actions={
            <>
              <GameActionButton variant="secondary" onClick={() => setShowPlayersDialog(true)}>
                Details
              </GameActionButton>
              <GameActionButton variant="primary" icon={NavigationIcon} onClick={handleGetDirections}>
                Route
              </GameActionButton>
              <GameActionButton variant="utility" icon={CalendarIcon} onClick={handleAddToCalendar}>
                Calendar
              </GameActionButton>
              {nextGame.isHost ? (
                <Link
                  to="/games/$gameId/manage"
                  params={{ gameId: nextGame.id }}
                  className="inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-lg border border-[#c3c5d9] bg-white px-4 text-sm font-semibold text-[#004ac6] transition hover:bg-[#eff4ff]"
                >
                  <SettingsIcon className="size-4" />
                  Manage
                </Link>
              ) : (
                <GameActionButton
                  variant="danger"
                  icon={UserMinusIcon}
                  disabled={isLeaving}
                  onClick={() => leaveMutation.mutate(nextGame.id)}
                >
                  {isLeaving ? "Leaving..." : "Leave"}
                </GameActionButton>
              )}
            </>
          }
        />
      </section>
      <ViewPlayersDialog
        gameId={nextGame.id}
        gameTitle={nextGame.title}
        open={showPlayersDialog}
        onOpenChange={setShowPlayersDialog}
      />
    </>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-4 text-2xl font-semibold leading-8 text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
      {children}
    </h2>
  );
}

function formatCountdown(game: DashboardGame) {
  const diff = game.scheduledAt.getTime() - Date.now();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `In ${days} ${days === 1 ? "Day" : "Days"}`;
  if (hours > 0) return `In ${hours} ${hours === 1 ? "Hour" : "Hours"}`;
  return "Starting Soon";
}
