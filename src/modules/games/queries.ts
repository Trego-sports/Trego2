import { queryOptions } from "@tanstack/react-query";
import { $getGame } from "./get-game";
import { $getGameParticipants } from "./get-game-participants";
import { $getPastGamesBySport } from "./get-past-games-by-sport";
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

  getRecommendedGames: () =>
    queryOptions({
      queryKey: ["recommended-games"],
      queryFn: async () => await $getRecommendedGames(),
    }),

  getPastGamesBySport: () =>
    queryOptions({
      queryKey: ["past-games-by-sport"],
      queryFn: async () => await $getPastGamesBySport(),
    }),
};
