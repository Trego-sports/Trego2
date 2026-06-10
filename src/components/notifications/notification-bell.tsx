import { useQuery } from "@tanstack/react-query";
import { BellIcon, CheckIcon, InboxIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { MyNotification } from "@/modules/notifications/get-my-notifications";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/modules/notifications/mutations";
import { notificationQueries } from "@/modules/notifications/queries";

const notificationTypeLabels: Record<string, string> = {
  game_joined: "Game joined",
  game_created: "Game created",
  game_announcement: "Game announcement",
  attendance_mark_reminder: "Attendance reminder",
  attendance_result_submitted: "Attendance result",
  friend_request_received: "Friend request",
  friend_request_accepted: "Friend accepted",
};

function formatNotificationTime(value: Date | string) {
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

function NotificationListItem({
  notification,
  onMarkRead,
  onDelete,
  isMarkingRead,
  isDeleting,
}: {
  notification: MyNotification;
  onMarkRead: (notificationId: string) => void;
  onDelete: (notification: MyNotification) => void;
  isMarkingRead: boolean;
  isDeleting: boolean;
}) {
  const isUnread = !notification.readAt;

  return (
    <li className={cn("border-b px-1 py-4 last:border-b-0", isUnread && "bg-accent/30")}>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-2 size-2 shrink-0 border",
            isUnread ? "border-primary bg-primary" : "border-muted-foreground bg-transparent",
          )}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="font-medium leading-snug">{notification.title}</p>
            <span className="sr-only">{isUnread ? "Unread" : "Read"}</span>
            <span className="text-xs text-muted-foreground">
              {notificationTypeLabels[notification.type] ?? "Notification"}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{notification.body}</p>
          <p className="text-xs text-muted-foreground">{formatNotificationTime(notification.createdAt)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {isUnread && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Mark notification as read"
              title="Mark as read"
              onClick={() => onMarkRead(notification.id)}
              disabled={isMarkingRead}
            >
              {isMarkingRead ? <Loader2Icon className="animate-spin" /> : <CheckIcon />}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Delete notification"
            title="Delete"
            onClick={() => onDelete(notification)}
            disabled={isDeleting}
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>
    </li>
  );
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<MyNotification | null>(null);
  const { data: unreadCount = 0 } = useQuery(notificationQueries.getUnreadCount());
  const {
    data: notifications = [],
    isFetching: isFetchingNotifications,
    isLoading: isLoadingNotifications,
  } = useQuery({
    ...notificationQueries.getMyNotifications(),
    enabled: isOpen,
  });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();
  const hasNotifications = notifications.length > 0;
  const visibleUnreadCount = unreadCount > 99 ? "99+" : String(unreadCount);

  const handleDeleteConfirm = async () => {
    if (!notificationToDelete) {
      return;
    }

    await deleteNotification.mutateAsync({ notificationId: notificationToDelete.id });
    setNotificationToDelete(null);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative"
        aria-label={unreadCount > 0 ? `Open notifications, ${unreadCount} unread` : "Open notifications"}
        title="Notifications"
        onClick={() => setIsOpen(true)}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center border border-background bg-destructive px-1 py-0.5 text-[10px] font-semibold leading-none text-destructive-foreground">
            {visibleUnreadCount}
          </span>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4 pr-8">
              <div>
                <DialogTitle>Notifications</DialogTitle>
                <DialogDescription>Read recent updates from games, attendance, and friend activity.</DialogDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => markAllRead.mutate()}
                disabled={unreadCount === 0 || markAllRead.isPending}
              >
                {markAllRead.isPending ? "Marking..." : "Mark all read"}
              </Button>
            </div>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto border">
            {isLoadingNotifications ? (
              <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Loading notifications...
              </div>
            ) : hasNotifications ? (
              <ul>
                {notifications.map((notification) => (
                  <NotificationListItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={(notificationId) => markRead.mutate({ notificationId })}
                    onDelete={setNotificationToDelete}
                    isMarkingRead={markRead.isPending}
                    isDeleting={deleteNotification.isPending}
                  />
                ))}
              </ul>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-6 text-center">
                <InboxIcon className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">No notifications yet</p>
                  <p className="text-sm text-muted-foreground">New game and friend updates will appear here.</p>
                </div>
              </div>
            )}
          </div>

          {isFetchingNotifications && !isLoadingNotifications && (
            <p className="text-xs text-muted-foreground">Refreshing notifications...</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!notificationToDelete} onOpenChange={(open) => !open && setNotificationToDelete(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete notification?</DialogTitle>
            <DialogDescription>This removes the notification from your notification center.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteNotification.isPending}
            >
              {deleteNotification.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
