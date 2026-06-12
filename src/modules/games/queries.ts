import { queryOptions } from "@tanstack/react-query";
import { $getAnnouncementThread } from "./get-announcement-thread";
import { $getGame } from "./get-game";
import { $getGameAnnouncements } from "./get-game-announcements";
import { $getGameParticipants } from "./get-game-participants";
import { $getInviteCandidates } from "./get-invite-candidates";
import { $getPastGames } from "./get-past-games";
import { $getRecommendedGames } from "./get-recommended-games";
import { $getUpcomingGames } from "./get-upcoming-games";

export const gameQueries = {
  getGame: (gameId: string) =>
    queryOptions({
      queryKey: ["game", gameId],
      queryFn: async () => await $getGame({ data: { gameId } }),
    }),

  getUpcomingGames: () =>
    queryOptions({
      queryKey: ["upcoming-games"],
      queryFn: async () => await $getUpcomingGames(),
    }),

  getGameParticipants: (gameId: string) =>
    queryOptions({
      queryKey: ["game-participants", gameId],
      queryFn: async () => await $getGameParticipants({ data: { gameId } }),
    }),

  getGameAnnouncements: (gameId: string) =>
    queryOptions({
      queryKey: ["game-announcements", gameId],
      queryFn: async () => await $getGameAnnouncements({ data: { gameId } }),
    }),

  getAnnouncementThread: (announcementId: string, threadParticipantUserId?: string) =>
    queryOptions({
      queryKey: ["announcement-thread", announcementId, threadParticipantUserId ?? "self"],
      queryFn: async () =>
        await $getAnnouncementThread({
          data: { announcementId, threadParticipantUserId },
        }),
    }),

  getInviteCandidates: (gameId: string) =>
    queryOptions({
      queryKey: ["game-invite-candidates", gameId],
      queryFn: async () => await $getInviteCandidates({ data: { gameId } }),
    }),

  getRecommendedGames: () =>
    queryOptions({
      queryKey: ["recommended-games"],
      queryFn: async () => await $getRecommendedGames(),
    }),

  getPastGames: () =>
    queryOptions({
      queryKey: ["past-games"],
      queryFn: async () => await $getPastGames(),
    }),
};
