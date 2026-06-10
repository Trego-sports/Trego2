import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { UserPlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INVITE_USER_NOT_FOUND_ERROR } from "@/modules/games/invite-player";
import { useInvitePlayer } from "@/modules/games/mutations";
import { gameQueries } from "@/modules/games/queries";

interface InvitePlayerPanelProps {
  gameId: string;
}

export function InvitePlayerPanel({ gameId }: InvitePlayerPanelProps) {
  const { userId } = useRouteContext({ from: "/_authed" });
  const { data: game } = useSuspenseQuery(gameQueries.getGame(gameId));
  const invitePlayer = useInvitePlayer();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [userNotFoundDialogOpen, setUserNotFoundDialogOpen] = useState(false);
  const isHost = game.hostId === userId;
  const { data: participants = [] } = useQuery({
    ...gameQueries.getGameParticipants(gameId),
    enabled: isHost,
  });
  const { data: candidates = [], isPending: isLoadingCandidates } = useQuery({
    ...gameQueries.getInviteCandidates(gameId),
    enabled: isHost,
  });

  if (!isHost) {
    return null;
  }

  const isFull = participants.length >= game.spotsTotal;
  const selectedCandidate = candidates.find((candidate) => candidate.userId === selectedUserId);
  const isInviting = invitePlayer.isPending;

  const handleInvite = async () => {
    if (!selectedUserId) {
      return;
    }

    await invitePlayer.mutateAsync({ gameId, userId: selectedUserId });
    setSelectedUserId("");
  };

  const handleEmailInvite = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return;
    }

    try {
      await invitePlayer.mutateAsync({ gameId, email: trimmedEmail });
      setEmail("");
    } catch (error) {
      if (error instanceof Error && error.message === INVITE_USER_NOT_FOUND_ERROR) {
        setUserNotFoundDialogOpen(true);
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlusIcon className="h-4 w-4" />
            Invite Player
          </CardTitle>
          <CardDescription>
            Host-only override that adds a player even if public attendance rules would block them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingCandidates ? (
            <p className="text-sm text-muted-foreground">Loading players...</p>
          ) : isFull ? (
            <p className="text-sm text-muted-foreground">This game is full.</p>
          ) : (
            <>
              {candidates.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-player-select">Invite from friends</Label>
                    <Select value={selectedUserId} onValueChange={(value) => setSelectedUserId(value as string)}>
                      <SelectTrigger id="invite-player-select" className="w-full">
                        <SelectValue>{selectedCandidate ? selectedCandidate.name : "Select a player..."}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {candidates.map((candidate) => (
                          <SelectItem key={candidate.userId} value={candidate.userId}>
                            {candidate.name} ({candidate.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="button" onClick={handleInvite} disabled={!selectedUserId || isInviting}>
                    {isInviting ? "Inviting..." : "Invite Player"}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No available friends to invite.</p>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or invite by email</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-player-email">Email address</Label>
                  <Input
                    id="invite-player-email"
                    type="email"
                    placeholder="player@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleEmailInvite();
                      }
                    }}
                  />
                </div>

                <Button type="button" onClick={handleEmailInvite} disabled={!email.trim() || isInviting}>
                  {isInviting ? "Inviting..." : "Invite by Email"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={userNotFoundDialogOpen} onOpenChange={setUserNotFoundDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>User not found</DialogTitle>
            <DialogDescription>
              This user does not exist. Please check the email again and try once more.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" />}>OK</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
