import { queryOptions } from "@tanstack/react-query";
import { $getGame } from "./get-game";
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
