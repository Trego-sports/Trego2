import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { ShieldCheckIcon, UserMinusIcon } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRemoveGameParticipant, useTransferGameHost } from "@/modules/games/mutations";
import { gameQueries } from "@/modules/games/queries";

interface GameLogisticsPanelProps {
  gameId: string;
}

interface Participant {
  userId: string;
  name: string;
  joinedViaInvite: boolean;
}

export function GameLogisticsPanel({ gameId }: GameLogisticsPanelProps) {
  const { userId } = useRouteContext({ from: "/_authed" });
  const { data: game } = useSuspenseQuery(gameQueries.getGame(gameId));
  const { data: participants } = useSuspenseQuery(gameQueries.getGameParticipants(gameId));
  const transferGameHost = useTransferGameHost();
  const removeGameParticipant = useRemoveGameParticipant();
  const [selectedNewHostUserId, setSelectedNewHostUserId] = useState("");
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<Participant | null>(null);
  const isHost = game.hostId === userId;

  if (!isHost) {
    return null;
  }

  const transferCandidates = participants.filter((participant) => participant.userId !== userId);
  const selectedNewHost = transferCandidates.find((participant) => participant.userId === selectedNewHostUserId);
  const removableParticipants = participants.filter((participant) => participant.userId !== userId);

  const handleTransferHost = async () => {
    if (!selectedNewHostUserId) {
      return;
    }

    await transferGameHost.mutateAsync({
      gameId,
      newHostUserId: selectedNewHostUserId,
    });
    setSelectedNewHostUserId("");
    setIsTransferDialogOpen(false);
  };

  const handleRemoveParticipant = async () => {
    if (!participantToRemove) {
      return;
    }

    await removeGameParticipant.mutateAsync({
      gameId,
      userId: participantToRemove.userId,
    });
    setParticipantToRemove(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4" />
            Game Logistics
          </CardTitle>
          <CardDescription>Transfer host ownership or remove players from this game.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold">Transfer host</h2>
              <p className="text-sm text-muted-foreground">
                The new host will receive host permissions immediately. You can leave the game after transferring.
              </p>
            </div>

            {transferCandidates.length > 0 ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="new-host-select">New host</Label>
                  <Select
                    value={selectedNewHostUserId}
                    onValueChange={(value) => setSelectedNewHostUserId(value as string)}
                  >
                    <SelectTrigger id="new-host-select" className="w-full">
                      <SelectValue>{selectedNewHost ? selectedNewHost.name : "Select a participant..."}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {transferCandidates.map((participant) => (
                        <SelectItem key={participant.userId} value={participant.userId}>
                          {participant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  className="w-full sm:translate-y-1 sm:w-auto"
                  onClick={() => setIsTransferDialogOpen(true)}
                  disabled={!selectedNewHostUserId || transferGameHost.isPending}
                >
                  Transfer Host
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add another participant before transferring host ownership.
              </p>
            )}
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold">Remove players</h2>
              <p className="text-sm text-muted-foreground">Removed players will no longer be part of this game.</p>
            </div>

            {removableParticipants.length > 0 ? (
              <div className="space-y-3">
                {removableParticipants.map((participant) => (
                  <div
                    key={participant.userId}
                    className="flex flex-col gap-3 border-b pb-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{participant.name}</p>
                      {participant.joinedViaInvite && <p className="text-xs text-muted-foreground">Joined by invite</p>}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setParticipantToRemove(participant)}
                      disabled={removeGameParticipant.isPending}
                    >
                      <UserMinusIcon />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">There are no other players in this game yet.</p>
            )}
          </section>
        </CardContent>
      </Card>

      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer host ownership?</DialogTitle>
            <DialogDescription>
              {selectedNewHost
                ? `${selectedNewHost.name} will become the host and receive all host-level controls.`
                : "Select a participant before transferring host ownership."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button
              type="button"
              onClick={handleTransferHost}
              disabled={!selectedNewHost || transferGameHost.isPending}
            >
              {transferGameHost.isPending ? "Transferring..." : "Confirm Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!participantToRemove} onOpenChange={(open) => !open && setParticipantToRemove(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Remove player?</DialogTitle>
            <DialogDescription>
              {participantToRemove
                ? `${participantToRemove.name} will be removed from this game.`
                : "This player will be removed from this game."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveParticipant}
              disabled={removeGameParticipant.isPending}
            >
              {removeGameParticipant.isPending ? "Removing..." : "Remove Player"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
