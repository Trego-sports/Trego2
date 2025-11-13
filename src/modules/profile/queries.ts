import { queryOptions } from "@tanstack/react-query";
import { $isSetupCompleted } from "./does-user-have-sports";
import { $getMyFriends } from "./get-my-friends";
import { $getMyProfile } from "./get-my-profile";
import { $getUserProfile } from "./get-user-profile";

export const userQueries = {
  isSetupCompleted: () =>
    queryOptions({
      queryKey: ["is-setup-completed"],
      queryFn: async () => await $isSetupCompleted(),
    }),

  getMyFriends: () =>
    queryOptions({
      queryKey: ["my-friends"],
      queryFn: async () => await $getMyFriends(),
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
