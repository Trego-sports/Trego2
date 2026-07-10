import type { FriendRequestStatus } from "@/db/tables";

export function getFriendshipPair(firstUserId: string, secondUserId: string) {
  return firstUserId.localeCompare(secondUserId) <= 0
    ? { userAId: firstUserId, userBId: secondUserId }
    : { userAId: secondUserId, userBId: firstUserId };
}

export function isPendingFriendRequest(status: FriendRequestStatus) {
  return status === "pending";
}
