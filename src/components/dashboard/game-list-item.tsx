import { Link } from "@tanstack/react-router";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useJoinGame, useLeaveGame } from "@/modules/games/mutations";
import type { DashboardGame } from "@/modules/games/types";
import { ViewPlayersDialog } from "./view-players-dialog";

interface GameListItemProps {
  game: DashboardGame;
  isParticipating: boolean;
}

export function GameListItem({ game, isParticipating }: GameListItemProps) {
  const [showPlayersDialog, setShowPlayersDialog] = useState(false);
  const joinGame = useJoinGame();
  const leaveGame = useLeaveGame();

  const renderActionButton = () => {
    if (!isParticipating) {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled={game.spotsFilled >= game.spotsTotal || (joinGame.isPending && joinGame.variables === game.id)}
          onClick={() => joinGame.mutate(game.id)}
        >
          {joinGame.isPending && joinGame.variables === game.id ? "Joining..." : "Join"}
        </Button>
      );
    }

    if (game.isHost) {
      return (
        <Link to="/games/$gameId/manage" params={{ gameId: game.id }}>
          <Button variant="outline" size="sm">
            Manage
          </Button>
        </Link>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        disabled={leaveGame.isPending && leaveGame.variables === game.id}
        onClick={() => leaveGame.mutate(game.id)}
      >
        {leaveGame.isPending && leaveGame.variables === game.id ? "Leaving..." : "Leave"}
      </Button>
    );
  };

  return (
    <>
      <div className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{game.title}</span>
            <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground">{game.sport}</span>
            {game.isHost && (
              <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded font-medium">Host</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <span>
                {game.scheduledAt.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-3 w-3" />
              <span>{game.locationName}</span>
              {game.distance && <span className="text-xs">({game.distance} km)</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Host: {game.hostName}</span>
            <span>•</span>
            <span>{game.skillLevels.join(", ")}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-4">
          <div className="flex items-center gap-1 text-sm">
            <UsersIcon className="h-4 w-4" />
            <span className="font-medium">
              {game.spotsFilled}/{game.spotsTotal}
            </span>
          </div>
          <div className="w-24 h-1.5 bg-muted">
            <div className="h-full bg-primary" style={{ width: `${(game.spotsFilled / game.spotsTotal) * 100}%` }} />
          </div>
          <div className="flex gap-1.5 mt-2">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowPlayersDialog(true)}>
              View Players
            </Button>
            {renderActionButton()}
          </div>
        </div>
      </div>
      <ViewPlayersDialog
        gameId={game.id}
        gameTitle={game.title}
        open={showPlayersDialog}
        onOpenChange={setShowPlayersDialog}
      />
    </>
  );
}
