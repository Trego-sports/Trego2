import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useToast } from "@/hooks/use-toast";
import { notificationQueries } from "@/modules/notifications";
import { $cancelFriendRequest, type CancelFriendRequestInput } from "./cancel-friend-request";
import { friendQueries } from "./queries";
import { $respondFriendRequest, type RespondFriendRequestInput } from "./respond-friend-request";
import { $sendFriendMessage, type SendFriendMessageInput } from "./send-friend-message";
import { $sendFriendRequest, type SendFriendRequestInput } from "./send-friend-request";

function useInvalidateFriendQueries() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: friendQueries.getFriendRequests().queryKey }),
      queryClient.invalidateQueries({ queryKey: friendQueries.getMyFriends().queryKey }),
      queryClient.invalidateQueries({ queryKey: ["friend-user-search"] }),
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      queryClient.invalidateQueries({ queryKey: notificationQueries.getUnreadCount().queryKey }),
    ]);
  };
}

export function useSendFriendRequest() {
  const toast = useToast();
  const invalidateFriendQueries = useInvalidateFriendQueries();
  const sendFriendRequestFn = useServerFn($sendFriendRequest);

  return useMutation({
    mutationFn: async (data: SendFriendRequestInput) => await sendFriendRequestFn({ data }),
    onSuccess: async () => {
      toast.add({
        type: "success",
        title: "Friend request sent",
        description: "They will see your request in their notifications.",
      });
      await invalidateFriendQueries();
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to send friend request",
        description: error instanceof Error ? error.message : "An error occurred while sending the friend request.",
      });
    },
  });
}

export function useRespondFriendRequest() {
  const toast = useToast();
  const invalidateFriendQueries = useInvalidateFriendQueries();
  const respondFriendRequestFn = useServerFn($respondFriendRequest);

  return useMutation({
    mutationFn: async (data: RespondFriendRequestInput) => await respondFriendRequestFn({ data }),
    onSuccess: async (_, data) => {
      toast.add({
        type: "success",
        title: data.action === "accept" ? "Friend request accepted" : "Friend request declined",
        description:
          data.action === "accept" ? "This user is now in your friends list." : "The request has been declined.",
      });
      await invalidateFriendQueries();
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to respond to friend request",
        description:
          error instanceof Error ? error.message : "An error occurred while responding to the friend request.",
      });
    },
  });
}

export function useCancelFriendRequest() {
  const toast = useToast();
  const invalidateFriendQueries = useInvalidateFriendQueries();
  const cancelFriendRequestFn = useServerFn($cancelFriendRequest);

  return useMutation({
    mutationFn: async (data: CancelFriendRequestInput) => await cancelFriendRequestFn({ data }),
    onSuccess: async () => {
      toast.add({
        type: "success",
        title: "Friend request cancelled",
        description: "The pending request has been cancelled.",
      });
      await invalidateFriendQueries();
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to cancel friend request",
        description: error instanceof Error ? error.message : "An error occurred while cancelling the friend request.",
      });
    },
  });
}

export function useSendFriendMessage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const sendFriendMessageFn = useServerFn($sendFriendMessage);

  return useMutation({
    mutationFn: async (data: SendFriendMessageInput) => await sendFriendMessageFn({ data }),
    onSuccess: async (_, data) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: friendQueries.getFriendChat({ friendUserId: data.friendUserId }).queryKey,
        }),
        queryClient.invalidateQueries({ queryKey: friendQueries.getMyFriends().queryKey }),
      ]);
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "An error occurred while sending the message.",
      });
    },
  });
}
