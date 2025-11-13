import { useQuery } from "@tanstack/react-query";
import { Link, useRouteContext } from "@tanstack/react-router";
import { UserIcon, UsersIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { gameQueries } from "@/modules/games/queries";

interface ViewPlayersDialogProps {
  gameId: string;
  gameTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewPlayersDialog({ gameId, gameTitle, open, onOpenChange }: ViewPlayersDialogProps) {
  const { userId } = useRouteContext({ from: "/_authed" });
  const { data: participants, isPending } = useQuery({
    ...gameQueries.getGameParticipants(gameId),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Players
          </DialogTitle>
          <DialogDescription>{gameTitle}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          {isPending ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading players...</div>
          ) : participants && participants.length > 0 ? (
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.userId} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <div className="h-10 w-10 flex items-center justify-center bg-muted rounded-full flex-shrink-0 overflow-hidden">
                    {participant.profilePictureUrl ? (
                      <img
                        src={participant.profilePictureUrl}
                        alt={participant.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to="/users/$userId"
                        params={{ userId: participant.userId }}
                        className="font-medium text-sm truncate hover:underline"
                        onClick={() => onOpenChange(false)}
                      >
                        {participant.name}
                      </Link>
                      {participant.userId === userId && (
                        <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground font-medium">Me</span>
                      )}
                      {participant.isHost && (
                        <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground font-medium">Host</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">No players yet</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
