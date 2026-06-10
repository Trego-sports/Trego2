import { queryOptions } from "@tanstack/react-query";
import { $getMyNotifications } from "./get-my-notifications";
import { $getUnreadNotificationCount } from "./get-unread-notification-count";

export const notificationQueries = {
  getMyNotifications: (limit = 50) =>
    queryOptions({
      queryKey: ["notifications", limit],
      queryFn: async () => await $getMyNotifications({ data: { limit } }),
    }),

  getUnreadCount: () =>
    queryOptions({
      queryKey: ["notifications", "unread-count"],
      queryFn: async () => await $getUnreadNotificationCount(),
      refetchInterval: 60_000,
      refetchOnWindowFocus: true,
    }),
};
