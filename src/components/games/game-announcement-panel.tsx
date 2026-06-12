import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { MegaphoneIcon } from "lucide-react";
import { useState } from "react";
import { AnnouncementThreadDialog } from "@/components/games/announcement-thread-dialog";
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
import type { GameAnnouncementAudienceType } from "@/db/tables";
import { cn } from "@/lib/utils";
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
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audienceType, setAudienceType] = useState<GameAnnouncementAudienceType>("all");
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [requiresAck, setRequiresAck] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeThread, setActiveThread] = useState<{
    announcementId: string;
    threadParticipantUserId: string;
  } | null>(null);

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
  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();
  const canSend =
    trimmedTitle.length > 0 &&
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
      title: trimmedTitle,
      body: trimmedBody,
      audienceType,
      requiresAck,
      recipientUserIds: audienceType === "selected" ? selectedRecipientIds : undefined,
    });

    setTitle("");
    setBody("");
    setAudienceType("all");
    setSelectedRecipientIds([]);
    setRequiresAck(false);
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
          <CardDescription>
            Send a message to all or selected participants. They will receive an in-app notification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {recipientCandidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add participants before sending announcements.</p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="announcement-title">Title</Label>
                <Input
                  id="announcement-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Location change, Bring equipment"
                  maxLength={120}
                />
                <p className="text-xs text-muted-foreground">{trimmedTitle.length}/120 characters</p>
              </div>

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

              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={requiresAck}
                  onChange={(event) => setRequiresAck(event.target.checked)}
                  className="size-4 border"
                />
                <span>Require participants to acknowledge this message</span>
              </label>

              {audienceType === "selected" && (
                <div className="space-y-3 border p-4">
                  <p className="text-sm font-medium">Select participants</p>
                  <div className="space-y-2">
                    {recipientCandidates.map((participant) => {
                      const isSelected = selectedRecipientIds.includes(participant.userId);

                      return (
                        <label key={participant.userId} className="flex cursor-pointer items-center gap-3 text-sm">
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
                {announcements.map((announcement) => {
                  const acknowledgedRecipients = announcement.recipients.filter(
                    (recipient) => recipient.acknowledgedAt,
                  );
                  const pendingRecipients = announcement.recipients.filter((recipient) => !recipient.acknowledgedAt);

                  return (
                    <div key={announcement.id} className="space-y-3 border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="font-medium leading-snug">{announcement.title}</p>
                          <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                            <span>
                              {announcement.audienceType === "all" ? "All participants" : "Selected participants"}
                            </span>
                            {announcement.requiresAck && <span>· Ack required</span>}
                            {announcement.replyThreadCount > 0 && (
                              <span>
                                · {announcement.replyThreadCount} conversation
                                {announcement.replyThreadCount === 1 ? "" : "s"}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatAnnouncementTime(announcement.createdAt)}
                        </p>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6">{announcement.body}</p>
                      {announcement.audienceType === "selected" && (
                        <p className="text-xs text-muted-foreground">
                          Sent to: {announcement.recipients.map((recipient) => recipient.name).join(", ")}
                        </p>
                      )}
                      {announcement.requiresAck && (
                        <div className="grid gap-2 text-xs sm:grid-cols-2">
                          <div className="border border-green-700/20 bg-green-700/5 p-3">
                            <p className="font-medium text-green-900">Acknowledged</p>
                            <p className="mt-1 text-muted-foreground">
                              {acknowledgedRecipients.length > 0
                                ? acknowledgedRecipients.map((recipient) => recipient.name).join(", ")
                                : "No one yet"}
                            </p>
                          </div>
                          <div className="border border-amber-700/20 bg-amber-700/5 p-3">
                            <p className="font-medium text-amber-900">Pending ack</p>
                            <p className="mt-1 text-muted-foreground">
                              {pendingRecipients.length > 0
                                ? pendingRecipients.map((recipient) => recipient.name).join(", ")
                                : "Everyone acknowledged"}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {announcement.recipients.map((recipient) => (
                          <Button
                            key={recipient.userId}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setActiveThread({
                                announcementId: announcement.id,
                                threadParticipantUserId: recipient.userId,
                              })
                            }
                          >
                            Thread with {recipient.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No announcements sent yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {activeThread && (
        <AnnouncementThreadDialog
          announcementId={activeThread.announcementId}
          threadParticipantUserId={activeThread.threadParticipantUserId}
          open={!!activeThread}
          onOpenChange={(open) => !open && setActiveThread(null)}
        />
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Send announcement?</DialogTitle>
            <DialogDescription>
              {audienceType === "all"
                ? `This will notify all ${recipientCandidates.length} participant${recipientCandidates.length === 1 ? "" : "s"}.`
                : `This will notify ${selectedRecipientIds.length} selected participant${selectedRecipientIds.length === 1 ? "" : "s"}.`}
              {requiresAck ? " Participants will be asked to acknowledge the message." : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 border bg-muted/30 p-3">
            <p className="text-sm font-medium">{trimmedTitle}</p>
            <p className="whitespace-pre-wrap text-sm leading-6">{trimmedBody}</p>
          </div>
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
