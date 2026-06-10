import { useQuery } from "@tanstack/react-query";
import { LockIcon, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAckGameAnnouncement, useReplyGameAnnouncement } from "@/modules/games/mutations";
import { useMarkNotificationRead } from "@/modules/notifications/mutations";
import { gameQueries } from "@/modules/games/queries";

interface AnnouncementThreadDialogProps {
  announcementId: string;
  threadParticipantUserId?: string;
  notificationId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatMessageTime(value: Date | string) {
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

export function AnnouncementThreadDialog({
  announcementId,
  threadParticipantUserId,
  notificationId,
  open,
  onOpenChange,
}: AnnouncementThreadDialogProps) {
  const [replyBody, setReplyBody] = useState("");
  const ackAnnouncement = useAckGameAnnouncement();
  const replyAnnouncement = useReplyGameAnnouncement();
  const markRead = useMarkNotificationRead();

  const {
    data: thread,
    isLoading,
    refetch,
  } = useQuery({
    ...gameQueries.getAnnouncementThread(announcementId, threadParticipantUserId),
    enabled: open,
  });

  useEffect(() => {
    if (!open) {
      setReplyBody("");
    }
  }, [open]);

  const trimmedReply = replyBody.trim();
  const isSubmitting = ackAnnouncement.isPending || replyAnnouncement.isPending;
  const isExpired = thread?.isExpired ?? false;

  const handleAck = async () => {
    await ackAnnouncement.mutateAsync({ announcementId });
    await refetch();
  };

  const handleReply = async () => {
    if (!trimmedReply) {
      return;
    }

    await replyAnnouncement.mutateAsync({
      announcementId,
      body: trimmedReply,
      threadParticipantUserId: thread?.isHost ? thread.threadParticipantUserId : undefined,
    });

    setReplyBody("");
    // Mark the notification as read now that the user has replied
    if (notificationId) {
      markRead.mutate({ notificationId });
    }
    await refetch();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{thread ? thread.announcementTitle : "Announcement"}</DialogTitle>
          <DialogDescription>
            {thread?.isHost
              ? `${thread.gameTitle} · Conversation with ${thread.threadParticipantName}`
              : `${thread?.gameTitle ?? "Game"} · Announcement thread`}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !thread ? (
          <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2Icon className="h-4 w-4 animate-spin" />
            Loading conversation...
          </div>
        ) : (
          <div className="space-y-4">
            {isExpired && (
              <div className="flex items-center gap-2 border border-muted-foreground/20 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                <LockIcon className="h-3.5 w-3.5 shrink-0" />
                <span>Session expired — this thread is read-only.</span>
              </div>
            )}

            <div className="space-y-2 border bg-muted/20 p-4">
              <p className="text-xs font-medium text-muted-foreground">Original announcement</p>
              <p className="whitespace-pre-wrap text-sm leading-6">{thread.originalBody}</p>
              {thread.requiresAck && (
                <p className="text-xs text-muted-foreground">
                  {thread.isHost
                    ? thread.hasAcked
                      ? `${thread.threadParticipantName} acknowledged this message.`
                      : `${thread.threadParticipantName} has not acknowledged yet.`
                    : thread.hasAcked
                      ? "You acknowledged this message."
                      : "Acknowledgment required."}
                </p>
              )}
            </div>

            {thread.messages.length > 0 ? (
              <div className="max-h-64 space-y-3 overflow-y-auto border p-4">
                {thread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("space-y-1", message.isMine ? "text-right" : "text-left")}
                  >
                    <p className="text-xs font-medium text-muted-foreground">
                      {message.isMine ? "You" : message.senderName} · {formatMessageTime(message.createdAt)}
                    </p>
                    <p
                      className={cn(
                        "inline-block whitespace-pre-wrap px-3 py-2 text-sm leading-6",
                        message.isMine ? "bg-primary/10 text-left" : "bg-muted/50",
                      )}
                    >
                      {message.body}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              !isExpired && (
                <p className="text-sm text-muted-foreground">No replies yet.</p>
              )
            )}

            {!isExpired && (
              <div className="space-y-2">
                <label htmlFor="announcement-reply" className="text-sm font-medium">
                  Write a reply
                </label>
                <textarea
                  id="announcement-reply"
                  value={replyBody}
                  onChange={(event) => setReplyBody(event.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  maxLength={2000}
                  className={cn(
                    "placeholder:text-muted-foreground bg-input flex min-h-20 w-full resize-y border px-3 py-2 text-base transition-[color,box-shadow,border-color] outline-none md:text-sm",
                    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  )}
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {!isExpired && thread?.canAck && (
              <Button type="button" variant="outline" onClick={handleAck} disabled={isSubmitting}>
                {ackAnnouncement.isPending ? "Acknowledging..." : "Acknowledge"}
              </Button>
            )}
          </div>
          {!isExpired && (
            <Button type="button" onClick={handleReply} disabled={!trimmedReply || isSubmitting || !thread}>
              {replyAnnouncement.isPending ? "Sending..." : "Send Reply"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
