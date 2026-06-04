import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useToast } from "@/hooks/use-toast";
import { $connectGoogleCalendar } from "@/lib/auth/google-calendar";
import { userQueries } from "@/modules/profile/queries";
import { $disconnectCalendar } from "./disconnect-calendar";
import { calendarQueries } from "./queries";
import { $setCalendarSyncEnabled } from "./set-sync-enabled";

export function useConnectGoogleCalendar() {
  const connectFn = useServerFn($connectGoogleCalendar);

  return useMutation({
    mutationFn: async (returnPath?: string) => {
      const result = await connectFn({ data: { returnPath } });
      return result;
    },
    onSuccess: (data) => {
      window.location.href = data.redirectUrl;
    },
  });
}

export function useSetCalendarSyncEnabled() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const setSyncFn = useServerFn($setCalendarSyncEnabled);

  return useMutation({
    mutationFn: async (syncEnabled: boolean) => await setSyncFn({ data: { syncEnabled } }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userQueries.getMyProfile().queryKey }),
        queryClient.invalidateQueries({ queryKey: calendarQueries.getStatus().queryKey }),
      ]);
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to update calendar settings",
        description: error instanceof Error ? error.message : "An error occurred.",
      });
    },
  });
}

export function useDisconnectCalendar() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const disconnectFn = useServerFn($disconnectCalendar);

  return useMutation({
    mutationFn: async () => await disconnectFn(),
    onSuccess: async () => {
      toast.add({
        type: "success",
        title: "Calendar disconnected",
        description: "Google Calendar has been disconnected from your account.",
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userQueries.getMyProfile().queryKey }),
        queryClient.invalidateQueries({ queryKey: calendarQueries.getStatus().queryKey }),
      ]);
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to disconnect calendar",
        description: error instanceof Error ? error.message : "An error occurred.",
      });
    },
  });
}
