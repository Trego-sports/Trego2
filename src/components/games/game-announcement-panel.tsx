import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { MegaphoneIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { GameAnnouncementAudienceType } from "@/db/tables";
import { useSendGameAnnouncement } from "@/modules/games/mutations";
import { gameQueries } from "@/modules/games/queries";

interface GameAnnouncementPanelProps {
  gameId: string;
}

function formatAnnouncementTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function GameAnnouncementPanel({ gameId }: GameAnnouncementPanelProps) {
  const { userId } = useRouteContext({ from: "/_authed" });
  const { data: game } = useSuspenseQuery(gameQueries.getGame(gameId));
  const sendAnnouncement = useSendGameAnnouncement();
  const [body, setBody] = useState("");
  const [audienceType, setAudienceType] = useState<GameAnnouncementAudienceType>("all");
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isHost = game.hostId === userId;
  const { data: participants = [] } = useQuery({
    ...gameQueries.getGameParticipants(gameId),
    enabled: isHost,
  });
  const { data: announcements = [], isLoading: isLoadingAnnouncements } = useQuery({
    ...gameQueries.getGameAnnouncements(gameId),
    enabled: isHost,
  });

  if (!isHost) {
    return null;
  }

  const recipientCandidates = participants.filter((participant) => participant.userId !== userId);
  const isSending = sendAnnouncement.isPending;
  const trimmedBody = body.trim();
  const canSend =
    trimmedBody.length > 0 &&
    (audienceType === "all" || selectedRecipientIds.length > 0) &&
    recipientCandidates.length > 0;

  const toggleRecipient = (participantUserId: string) => {
    setSelectedRecipientIds((current) =>
      current.includes(participantUserId)
        ? current.filter((id) => id !== participantUserId)
        : [...current, participantUserId],
    );
  };

  const handleSend = async () => {
    await sendAnnouncement.mutateAsync({
      gameId,
      body: trimmedBody,
      audienceType,
      recipientUserIds: audienceType === "selected" ? selectedRecipientIds : undefined,
    });

    setBody("");
    setAudienceType("all");
    setSelectedRecipientIds([]);
    setConfirmOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MegaphoneIcon className="h-4 w-4" />
            Game Announcements
          </CardTitle>
          <CardDescription>Send a message to all or selected participants. They will receive an in-app notification.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {recipientCandidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add participants before sending announcements.</p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="announcement-body">Message</Label>
                <textarea
                  id="announcement-body"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Share updates, reminders, or last-minute changes..."
                  rows={4}
                  maxLength={2000}
                  className={cn(
                    "placeholder:text-muted-foreground bg-input flex min-h-24 w-full resize-y border px-3 py-2 text-base transition-[color,box-shadow,border-color] outline-none md:text-sm",
                    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  )}
                />
                <p className="text-xs text-muted-foreground">{trimmedBody.length}/2000 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="announcement-audience">Recipients</Label>
                <Select
                  value={audienceType}
                  onValueChange={(value) => {
                    setAudienceType(value as GameAnnouncementAudienceType);
                    if (value === "all") {
                      setSelectedRecipientIds([]);
                    }
                  }}
                >
                  <SelectTrigger id="announcement-audience" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All participants</SelectItem>
                    <SelectItem value="selected">Selected participants</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {audienceType === "selected" && (
                <div className="space-y-3 border p-4">
                  <p className="text-sm font-medium">Select participants</p>
                  <div className="space-y-2">
                    {recipientCandidates.map((participant) => {
                      const isSelected = selectedRecipientIds.includes(participant.userId);

                      return (
                        <label
                          key={participant.userId}
                          className="flex cursor-pointer items-center gap-3 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRecipient(participant.userId)}
                            className="size-4 border"
                          />
                          <span>{participant.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button type="button" onClick={() => setConfirmOpen(true)} disabled={!canSend || isSending}>
                {isSending ? "Sending..." : "Send Announcement"}
              </Button>
            </>
          )}

          <div className="space-y-3 border-t pt-6">
            <div>
              <h3 className="text-sm font-medium">Announcement History</h3>
              <p className="text-xs text-muted-foreground">Previously sent announcements for this game.</p>
            </div>

            {isLoadingAnnouncements ? (
              <p className="text-sm text-muted-foreground">Loading announcement history...</p>
            ) : announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="space-y-2 border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {announcement.audienceType === "all" ? "All participants" : "Selected participants"}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatAnnouncementTime(announcement.createdAt)}</p>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-6">{announcement.body}</p>
                    {announcement.audienceType === "selected" && (
                      <p className="text-xs text-muted-foreground">
                        Sent to: {announcement.recipients.map((recipient) => recipient.name).join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No announcements sent yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Send announcement?</DialogTitle>
            <DialogDescription>
              {audienceType === "all"
                ? `This will notify all ${recipientCandidates.length} participant${recipientCandidates.length === 1 ? "" : "s"}.`
                : `This will notify ${selectedRecipientIds.length} selected participant${selectedRecipientIds.length === 1 ? "" : "s"}.`}
            </DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-wrap border bg-muted/30 p-3 text-sm leading-6">{trimmedBody}</p>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="button" onClick={handleSend} disabled={isSending}>
              {isSending ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
