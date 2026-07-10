import { queryOptions } from "@tanstack/react-query";
import { $getFriendChat, type GetFriendChatInput } from "./get-friend-chat";
import { $getFriendRequests } from "./get-friend-requests";
import { $getMyFriends } from "./get-my-friends";
import { $searchUsers, type SearchUsersInput } from "./search-users";

export const friendQueries = {
  getFriendRequests: () =>
    queryOptions({
      queryKey: ["friend-requests"],
      queryFn: async () => await $getFriendRequests(),
    }),

  getMyFriends: () =>
    queryOptions({
      queryKey: ["friends"],
      refetchInterval: 60_000,
      refetchOnWindowFocus: true,
      queryFn: async () => await $getMyFriends(),
    }),

  getFriendChat: (data: GetFriendChatInput) =>
    queryOptions({
      queryKey: ["friend-chat", data.friendUserId],
      queryFn: async () => await $getFriendChat({ data }),
      refetchInterval: 60_000,
      refetchOnWindowFocus: true,
    }),

  searchUsers: (data: SearchUsersInput) =>
    queryOptions({
      queryKey: ["friend-user-search", data.query],
      queryFn: async () => await $searchUsers({ data }),
      enabled: data.query.trim().length >= 2,
    }),
};
