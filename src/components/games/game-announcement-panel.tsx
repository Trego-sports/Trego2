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
      <Card className="rounded-lg border-[#c3c6d7] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#d3e4fe] text-[#004ac6]">
              <MegaphoneIcon className="size-5" />
            </span>
            Game Announcements
          </CardTitle>
          <CardDescription className="text-[#647086]">
            Send a message to all or selected participants. They will receive an in-app notification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {recipientCandidates.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#c3c6d7] bg-[#f8f9ff] p-5 text-center">
              <MegaphoneIcon className="mx-auto mb-2 size-8 text-[#647086]" />
              <p className="text-sm font-semibold text-[#0b1c30]">Add participants before sending announcements.</p>
            </div>
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
                <p className="text-xs font-medium text-[#647086]">{trimmedTitle.length}/120 characters</p>
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
                    "flex min-h-24 w-full resize-y rounded-lg border border-[#c3c6d7] bg-white px-3 py-2 text-base text-[#0b1c30] shadow-sm outline-none transition-[color,box-shadow,border-color] placeholder:text-[#8a93a8] md:text-sm",
                    "focus-visible:border-[#004ac6] focus-visible:ring-2 focus-visible:ring-[#004ac6]/20",
                  )}
                />
                <p className="text-xs font-medium text-[#647086]">{trimmedBody.length}/2000 characters</p>
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

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#c3c6d7] bg-[#f8f9ff] p-3 text-sm font-medium text-[#0b1c30]">
                <input
                  type="checkbox"
                  checked={requiresAck}
                  onChange={(event) => setRequiresAck(event.target.checked)}
                  className="size-4 accent-[#004ac6]"
                />
                <span>Require participants to acknowledge this message</span>
              </label>

              {audienceType === "selected" && (
                <div className="space-y-3 rounded-lg border border-[#c3c6d7] bg-[#f8f9ff] p-4">
                  <p className="text-sm font-bold text-[#0b1c30]">Select participants</p>
                  <div className="space-y-2">
                    {recipientCandidates.map((participant) => {
                      const isSelected = selectedRecipientIds.includes(participant.userId);

                      return (
                        <label
                          key={participant.userId}
                          className="flex cursor-pointer items-center gap-3 rounded-lg bg-white p-3 text-sm font-medium text-[#0b1c30]"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRecipient(participant.userId)}
                            className="size-4 accent-[#004ac6]"
                          />
                          <span>{participant.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button
                type="button"
                className="bg-[#004ac6]"
                onClick={() => setConfirmOpen(true)}
                disabled={!canSend || isSending}
              >
                {isSending ? "Sending..." : "Send Announcement"}
              </Button>
            </>
          )}

          <div className="space-y-3 border-t border-[#e4e8f2] pt-6">
            <div>
              <h3 className="text-sm font-bold text-[#0b1c30]">Announcement History</h3>
              <p className="text-xs font-medium text-[#647086]">Previously sent announcements for this game.</p>
            </div>

            {isLoadingAnnouncements ? (
              <p className="rounded-lg border border-[#c3c6d7] bg-[#f8f9ff] p-4 text-sm font-medium text-[#647086]">
                Loading announcement history...
              </p>
            ) : announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.map((announcement) => {
                  const acknowledgedRecipients = announcement.recipients.filter(
                    (recipient) => recipient.acknowledgedAt,
                  );
                  const pendingRecipients = announcement.recipients.filter((recipient) => !recipient.acknowledgedAt);

                  return (
                    <div
                      key={announcement.id}
                      className="space-y-3 rounded-lg border border-[#c3c6d7] bg-[#f8f9ff] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="font-bold leading-snug text-[#0b1c30]">{announcement.title}</p>
                          <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#647086]">
                            <span className="rounded-full bg-[#e5eeff] px-2 py-1 text-[#004ac6]">
                              {announcement.audienceType === "all" ? "All participants" : "Selected participants"}
                            </span>
                            {announcement.requiresAck && (
                              <span className="rounded-full bg-[#fff4d8] px-2 py-1 text-[#946200]">Ack required</span>
                            )}
                            {announcement.replyThreadCount > 0 && (
                              <span className="rounded-full bg-white px-2 py-1 text-[#647086]">
                                {announcement.replyThreadCount} conversation
                                {announcement.replyThreadCount === 1 ? "" : "s"}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-[#647086]">
                          {formatAnnouncementTime(announcement.createdAt)}
                        </p>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6 text-[#263248]">{announcement.body}</p>
                      {announcement.audienceType === "selected" && (
                        <p className="text-xs font-medium text-[#647086]">
                          Sent to: {announcement.recipients.map((recipient) => recipient.name).join(", ")}
                        </p>
                      )}
                      {announcement.requiresAck && (
                        <div className="grid gap-2 text-xs sm:grid-cols-2">
                          <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-3">
                            <p className="font-bold text-[#166534]">Acknowledged</p>
                            <p className="mt-1 font-medium text-[#647086]">
                              {acknowledgedRecipients.length > 0
                                ? acknowledgedRecipients.map((recipient) => recipient.name).join(", ")
                                : "No one yet"}
                            </p>
                          </div>
                          <div className="rounded-lg border border-[#fde68a] bg-[#fffbeb] p-3">
                            <p className="font-bold text-[#92400e]">Pending ack</p>
                            <p className="mt-1 font-medium text-[#647086]">
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
              <div className="rounded-lg border border-dashed border-[#c3c6d7] bg-[#f8f9ff] p-5 text-center">
                <p className="text-sm font-bold text-[#0b1c30]">No announcements sent yet.</p>
                <p className="mt-1 text-xs font-medium text-[#647086]">Updates you send will appear here.</p>
              </div>
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
          <div className="space-y-2 rounded-lg border border-[#c3c6d7] bg-[#f8f9ff] p-3">
            <p className="text-sm font-bold text-[#0b1c30]">{trimmedTitle}</p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-[#263248]">{trimmedBody}</p>
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
