import { Link } from "@tanstack/react-router";
import { SettingsIcon, UserMinusIcon } from "lucide-react";
import { useState } from "react";
import { useJoinGame, useLeaveGame } from "@/modules/games/mutations";
import type { DashboardGame } from "@/modules/games/types";
import { GameActionButton, GameCompactListItem, getGameStatus } from "./game-card-system";
import { ViewPlayersDialog } from "./view-players-dialog";

interface GameListItemProps {
  game: DashboardGame;
  isParticipating: boolean;
}

export function GameListItem({ game, isParticipating }: GameListItemProps) {
  const [showPlayersDialog, setShowPlayersDialog] = useState(false);
  const joinGame = useJoinGame();
  const leaveGame = useLeaveGame();
  const status = getGameStatus(game, isParticipating);
  const isJoining = joinGame.isPending && joinGame.variables === game.id;
  const isLeaving = leaveGame.isPending && leaveGame.variables === game.id;

  const action = !isParticipating ? (
    <GameActionButton
      variant="utility"
      disabled={status === "full" || isJoining}
      onClick={() => joinGame.mutate(game.id)}
      className="min-w-20"
    >
      {isJoining ? "Joining..." : status === "full" ? "Full" : "Join"}
    </GameActionButton>
  ) : game.isHost ? (
    <Link
      to="/games/$gameId/manage"
      params={{ gameId: game.id }}
      className="inline-flex h-10 min-w-20 items-center justify-center gap-2 rounded-lg border border-[#c3c5d9] bg-white px-4 text-sm font-semibold text-[#004ac6] transition hover:bg-[#eff4ff]"
    >
      <SettingsIcon className="size-4" />
      Manage
    </Link>
  ) : (
    <GameActionButton
      variant="danger"
      icon={UserMinusIcon}
      disabled={isLeaving}
      onClick={() => leaveGame.mutate(game.id)}
      className="min-w-20"
    >
      {isLeaving ? "Leaving..." : "Leave"}
    </GameActionButton>
  );

  return (
    <>
      <GameCompactListItem
        game={game}
        status={status}
        action={action}
        onViewPlayers={() => setShowPlayersDialog(true)}
      />
      <ViewPlayersDialog
        gameId={game.id}
        gameTitle={game.title}
        open={showPlayersDialog}
        onOpenChange={setShowPlayersDialog}
      />
    </>
  );
}
