import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AnnouncementThreadDialog } from "@/components/games/announcement-thread-dialog";
import { Button } from "@/components/ui/button";
import { useAckGameAnnouncement } from "@/modules/games/mutations";
import { gameQueries } from "@/modules/games/queries";
import type { MyNotification } from "@/modules/notifications/get-my-notifications";

const announcementNotificationTypes = new Set([
  "game_announcement",
  "game_announcement_ack",
  "game_announcement_reply",
]);

export function isAnnouncementNotification(notification: MyNotification) {
  return announcementNotificationTypes.has(notification.type);
}

function getThreadParticipantUserId(notification: MyNotification) {
  const metadataParticipantId = notification.metadata?.threadParticipantUserId;

  if (typeof metadataParticipantId === "string") {
    return metadataParticipantId;
  }

  if (
    (notification.type === "game_announcement_ack" || notification.type === "game_announcement_reply") &&
    notification.actorUserId
  ) {
    return notification.actorUserId;
  }

  return undefined;
}

export function AnnouncementNotificationActions({
  notification,
}: {
  notification: MyNotification;
}) {
  const [threadOpen, setThreadOpen] = useState(false);
  const ackAnnouncement = useAckGameAnnouncement();
  const announcementId = notification.metadata?.announcementId;

  if (typeof announcementId !== "string") {
    return null;
  }

  const threadParticipantUserId = getThreadParticipantUserId(notification);

  const { data: threadState } = useQuery({
    ...gameQueries.getAnnouncementThread(announcementId, threadParticipantUserId),
    enabled: true,
  });

  const isExpired = threadState?.isExpired ?? false;

  const handleAck = async () => {
    await ackAnnouncement.mutateAsync({ announcementId });
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {!isExpired && threadState?.requiresAck && !threadState.isHost && !threadState.hasAcked && (
          <span className="inline-flex items-center border border-amber-700/30 bg-amber-700/10 px-2.5 py-1 text-xs font-medium text-amber-900">
            Acknowledgment required
          </span>
        )}
        {!isExpired && threadState?.canAck && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAck}
            disabled={ackAnnouncement.isPending}
          >
            {ackAnnouncement.isPending ? "Acknowledging..." : "Acknowledge"}
          </Button>
        )}
        <Button type="button" variant="outline" size="sm" onClick={() => setThreadOpen(true)}>
          {isExpired ? "View session" : "Reply"}
        </Button>
      </div>

      <AnnouncementThreadDialog
        announcementId={announcementId}
        threadParticipantUserId={threadParticipantUserId}
        notificationId={notification.id}
        open={threadOpen}
        onOpenChange={setThreadOpen}
      />
    </>
  );
}
