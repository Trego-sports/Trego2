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
      <DialogContent className="border-[#c3c5d9] bg-[#f8f9ff] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#0b1c30]">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#d3e4fe] text-[#004ac6]">
              <UsersIcon className="size-5" />
            </span>
            Players
          </DialogTitle>
          <DialogDescription className="line-clamp-2">{gameTitle}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto rounded-lg border border-[#e0e3e5] bg-white p-2">
          {isPending ? (
            <div className="py-8 text-center text-sm text-[#434656]">Loading players...</div>
          ) : participants && participants.length > 0 ? (
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-[#eff4ff]"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#d3e4fe] text-[#004ac6]">
                    {participant.profilePictureUrl ? (
                      <img
                        src={participant.profilePictureUrl}
                        alt={participant.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <UserIcon className="size-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <Link
                        to="/users/$userId"
                        params={{ userId: participant.userId }}
                        className="truncate text-sm font-bold text-[#0b1c30] hover:underline"
                        onClick={() => onOpenChange(false)}
                      >
                        {participant.name}
                      </Link>
                      {participant.userId === userId && (
                        <span className="rounded-full bg-[#e6e8ea] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-[#434656]">
                          Me
                        </span>
                      )}
                      {participant.isHost && (
                        <span className="rounded-full bg-[#d3e4fe] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-[#0038b6]">
                          Host
                        </span>
                      )}
                      {participant.joinedViaInvite && (
                        <span className="rounded-full bg-[#e6e8ea] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-[#434656]">
                          Invited
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-[#434656]">No players yet</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
