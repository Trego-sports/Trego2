import { useQuery } from "@tanstack/react-query";
import { BellIcon, CheckIcon, InboxIcon, Loader2Icon, SearchIcon, Trash2Icon, XIcon } from "lucide-react";
import { useState } from "react";
import {
  AnnouncementNotificationActions,
  isAnnouncementNotification,
} from "@/components/notifications/announcement-notification-actions";
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
  useDeleteMultipleNotifications,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/modules/notifications/mutations";
import { notificationQueries } from "@/modules/notifications/queries";

const notificationTypeLabels: Record<string, string> = {
  game_joined: "Game joined",
  game_created: "Game created",
  game_cancelled: "Game cancelled",
  game_host_transferred: "Host transferred",
  game_removed: "Removed from game",
  game_announcement: "Game announcement",
  game_announcement_ack: "Announcement ack",
  game_announcement_reply: "Announcement reply",
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

function AttendanceNotificationStatus({ status }: { status: "present" | "absent" }) {
  const isPresent = status === "present";

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-black",
        isPresent ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#991b1b]",
      )}
    >
      {isPresent ? "Present" : "Absent"}
    </span>
  );
}

function getAttendanceStatus(notification: MyNotification) {
  const status = notification.metadata?.attendanceStatus;

  if (status === "present" || status === "absent") {
    return status;
  }

  return null;
}

function NotificationListItem({
  notification,
  onMarkRead,
  onDelete,
  isMarkingRead,
  isDeleting,
  selectMode,
  isSelected,
  onToggleSelect,
}: {
  notification: MyNotification;
  onMarkRead: (notificationId: string) => void;
  onDelete: (notification: MyNotification) => void;
  isMarkingRead: boolean;
  isDeleting: boolean;
  selectMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const isUnread = !notification.readAt;
  const attendanceStatus = getAttendanceStatus(notification);

  return (
    <li
      className={cn(
        "rounded-lg border border-[#d8def0] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition",
        isUnread && "border-[#9db9f6] bg-[#f4f8ff]",
        isSelected && "border-[#004ac6] bg-[#eff4ff]",
      )}
    >
      <div className="flex items-start gap-3">
        {selectMode ? (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(notification.id)}
            className="mt-2 size-4 shrink-0 cursor-pointer rounded border-[#9aa3b8] accent-[#004ac6]"
            aria-label={`Select notification: ${notification.title}`}
          />
        ) : (
          <span
            className={cn(
              "mt-2 size-2.5 shrink-0 rounded-full border",
              isUnread ? "border-[#004ac6] bg-[#004ac6]" : "border-[#c3c6d7] bg-transparent",
            )}
            aria-hidden="true"
          />
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="font-black leading-snug text-[#0b1c30]">{notification.title}</p>
            <span className="sr-only">{isUnread ? "Unread" : "Read"}</span>
            <span className="rounded-full bg-[#e5eeff] px-2 py-0.5 text-xs font-bold text-[#004ac6]">
              {notificationTypeLabels[notification.type] ?? "Notification"}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm font-medium leading-6 text-[#647086]">{notification.body}</p>
          {attendanceStatus && <AttendanceNotificationStatus status={attendanceStatus} />}
          {!selectMode && isAnnouncementNotification(notification) && (
            <AnnouncementNotificationActions notification={notification} />
          )}
          <p className="text-xs font-bold text-[#647086]">{formatNotificationTime(notification.createdAt)}</p>
        </div>
        {!selectMode && (
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
        )}
      </div>
    </li>
  );
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notificationToDelete, setNotificationToDelete] = useState<MyNotification | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

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
  const deleteMultiple = useDeleteMultipleNotifications();

  const trimmedSearch = searchQuery.trim().toLowerCase();
  const filteredNotifications = trimmedSearch
    ? notifications.filter(
        (n) => n.title.toLowerCase().includes(trimmedSearch) || n.body.toLowerCase().includes(trimmedSearch),
      )
    : notifications;
  const hasNotifications = notifications.length > 0;
  const visibleUnreadCount = unreadCount > 99 ? "99+" : String(unreadCount);

  const allVisibleSelected =
    filteredNotifications.length > 0 && filteredNotifications.every((n) => selectedIds.has(n.id));

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery("");
      setSelectMode(false);
      setSelectedIds(new Set());
    }
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

  const handleBulkDeleteConfirm = async () => {
    await deleteMultiple.mutateAsync([...selectedIds]);
    setSelectedIds(new Set());
    setSelectMode(false);
    setConfirmBulkDelete(false);
  };

  const handleDeleteConfirm = async () => {
    if (!notificationToDelete) return;
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
          <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#b91c1c] px-1 py-0.5 text-[10px] font-black leading-none text-white">
            {visibleUnreadCount}
          </span>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4 pr-8">
              <div>
                <DialogTitle>Notifications</DialogTitle>
                <DialogDescription>Read recent updates from games, attendance, and friend activity.</DialogDescription>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {selectMode ? (
                  <>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirmBulkDelete(true)}
                      disabled={selectedIds.size === 0 || deleteMultiple.isPending}
                    >
                      <Trash2Icon className="mr-1.5 h-3.5 w-3.5" />
                      Delete ({selectedIds.size})
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={exitSelectMode}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    {hasNotifications && (
                      <Button type="button" variant="outline" size="sm" onClick={() => setSelectMode(true)}>
                        Select
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => markAllRead.mutate()}
                      disabled={unreadCount === 0 || markAllRead.isPending}
                    >
                      {markAllRead.isPending ? "Marking..." : "Mark all read"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#647086]" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#c3c6d7] bg-white py-2.5 pr-8 pl-9 text-sm font-medium text-[#0b1c30] shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none placeholder:text-[#7b8496] focus-visible:border-[#004ac6] focus-visible:ring-2 focus-visible:ring-[#004ac6]/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-[#647086] hover:text-[#004ac6]"
                aria-label="Clear search"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {selectMode && filteredNotifications.length > 0 && (
            <label className="flex cursor-pointer items-center gap-2 px-1 text-sm">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={handleToggleAll}
                className="size-4 rounded border-[#9aa3b8] accent-[#004ac6]"
              />
              <span className="font-medium text-[#647086]">{allVisibleSelected ? "Deselect all" : "Select all"}</span>
              {selectedIds.size > 0 && (
                <span className="ml-auto text-xs font-bold text-[#647086]">{selectedIds.size} selected</span>
              )}
            </label>
          )}

          <div className="max-h-[55vh] overflow-y-auto rounded-lg border border-[#d8def0] bg-[#f8f9ff] p-3">
            {isLoadingNotifications ? (
              <div className="flex min-h-48 items-center justify-center gap-2 text-sm font-medium text-[#647086]">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Loading notifications...
              </div>
            ) : !hasNotifications ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-[#e5eeff] text-[#004ac6]">
                  <InboxIcon className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-black text-[#0b1c30]">No notifications yet</p>
                  <p className="text-sm font-medium text-[#647086]">New game and friend updates will appear here.</p>
                </div>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <ul className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <NotificationListItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={(notificationId) => markRead.mutate({ notificationId })}
                    onDelete={setNotificationToDelete}
                    isMarkingRead={markRead.isPending}
                    isDeleting={deleteNotification.isPending}
                    selectMode={selectMode}
                    isSelected={selectedIds.has(notification.id)}
                    onToggleSelect={handleToggleSelect}
                  />
                ))}
              </ul>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-[#e5eeff] text-[#004ac6]">
                  <SearchIcon className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-black text-[#0b1c30]">No results</p>
                  <p className="text-sm font-medium text-[#647086]">
                    No notifications match &ldquo;{searchQuery.trim()}&rdquo;.
                  </p>
                </div>
              </div>
            )}
          </div>

          {isFetchingNotifications && !isLoadingNotifications && (
            <p className="text-xs font-medium text-[#647086]">Refreshing notifications...</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Single delete confirm */}
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

      {/* Bulk delete confirm */}
      <Dialog open={confirmBulkDelete} onOpenChange={(open) => !open && setConfirmBulkDelete(false)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              Delete {selectedIds.size} notification{selectedIds.size === 1 ? "" : "s"}?
            </DialogTitle>
            <DialogDescription>
              This removes the selected notifications from your notification center.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleBulkDeleteConfirm}
              disabled={deleteMultiple.isPending}
            >
              {deleteMultiple.isPending ? "Deleting..." : `Delete ${selectedIds.size}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
