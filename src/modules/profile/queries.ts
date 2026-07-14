import { queryOptions } from "@tanstack/react-query";
import { $isSetupCompleted } from "./does-user-have-sports";
import { $getMyProfile } from "./get-my-profile";
import { $getSuggestedFriends } from "./get-suggested-friends";
import { $getUserProfile } from "./get-user-profile";

export const userQueries = {
  isSetupCompleted: () =>
    queryOptions({
      queryKey: ["is-setup-completed"],
      queryFn: async () => await $isSetupCompleted(),
    }),

  getSuggestedFriends: () =>
    queryOptions({
      queryKey: ["suggested-friends"],
      queryFn: async () => await $getSuggestedFriends(),
    }),

  getMyProfile: () =>
    queryOptions({
      queryKey: ["my-profile"],
      queryFn: async () => await $getMyProfile(),
    }),

  getUserProfile: (userId: string) =>
    queryOptions({
      queryKey: ["user-public-profile", userId],
      queryFn: async () => await $getUserProfile({ data: { userId } }),
    }),
};
