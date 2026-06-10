import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useToast } from "@/hooks/use-toast";
import { $acknowledgeNotification } from "./acknowledge-notification";
import { $deleteMultipleNotifications } from "./delete-multiple-notifications";
import { $deleteNotification } from "./delete-notification";
import { $markAllNotificationsRead } from "./mark-all-notifications-read";
import { $markNotificationRead, type NotificationIdInput } from "./mark-notification-read";
import { notificationQueries } from "./queries";

function useInvalidateNotificationQueries() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      queryClient.invalidateQueries({ queryKey: notificationQueries.getUnreadCount().queryKey }),
    ]);
  };
}

export function useMarkNotificationRead() {
  const invalidateNotificationQueries = useInvalidateNotificationQueries();
  const markNotificationReadFn = useServerFn($markNotificationRead);

  return useMutation({
    mutationFn: async (data: NotificationIdInput) => await markNotificationReadFn({ data }),
    onSuccess: invalidateNotificationQueries,
  });
}

export function useMarkAllNotificationsRead() {
  const invalidateNotificationQueries = useInvalidateNotificationQueries();
  const markAllNotificationsReadFn = useServerFn($markAllNotificationsRead);

  return useMutation({
    mutationFn: async () => await markAllNotificationsReadFn(),
    onSuccess: invalidateNotificationQueries,
  });
}

export function useAcknowledgeNotification() {
  const invalidateNotificationQueries = useInvalidateNotificationQueries();
  const acknowledgeNotificationFn = useServerFn($acknowledgeNotification);

  return useMutation({
    mutationFn: async (data: NotificationIdInput) => await acknowledgeNotificationFn({ data }),
    onSuccess: invalidateNotificationQueries,
  });
}

export function useDeleteMultipleNotifications() {
  const toast = useToast();
  const invalidateNotificationQueries = useInvalidateNotificationQueries();
  const deleteMultipleFn = useServerFn($deleteMultipleNotifications);

  return useMutation({
    mutationFn: async (notificationIds: string[]) => await deleteMultipleFn({ data: { notificationIds } }),
    onSuccess: async (_, ids) => {
      toast.add({
        type: "success",
        title: `${ids.length} notification${ids.length === 1 ? "" : "s"} deleted`,
        description: "Selected notifications have been removed.",
      });
      await invalidateNotificationQueries();
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to delete notifications",
        description: error instanceof Error ? error.message : "An error occurred.",
      });
    },
  });
}

export function useDeleteNotification() {
  const toast = useToast();
  const invalidateNotificationQueries = useInvalidateNotificationQueries();
  const deleteNotificationFn = useServerFn($deleteNotification);

  return useMutation({
    mutationFn: async (data: NotificationIdInput) => await deleteNotificationFn({ data }),
    onSuccess: async () => {
      toast.add({
        type: "success",
        title: "Notification deleted",
        description: "The notification has been removed.",
      });
      await invalidateNotificationQueries();
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to delete notification",
        description: error instanceof Error ? error.message : "An error occurred while deleting the notification.",
      });
    },
  });
}
