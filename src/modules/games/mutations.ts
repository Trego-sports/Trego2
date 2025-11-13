import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useToast } from "@/hooks/use-toast";
import { $cancelGame } from "./cancel-game";
import { $createGame, type CreateGameInput } from "./create-game";
import { $joinGame } from "./join-game";
import { $leaveGame } from "./leave-game";
import { gameQueries } from "./queries";
import { $updateGame, type UpdateGameInput } from "./update-game";

export function useCreateGame() {
  const toast = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const createGameFn = useServerFn($createGame);

  return useMutation({
    mutationFn: async (data: CreateGameInput) => await createGameFn({ data }),
    onSuccess: async () => {
      toast.add({
        type: "success",
        title: "Game created",
        description: "Your game has been created successfully.",
      });
      await queryClient.invalidateQueries({ queryKey: gameQueries.getUpcomingGames().queryKey });
      await router.navigate({ to: "/dashboard" });
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to create game",
        description: error instanceof Error ? error.message : "An error occurred while creating the game.",
      });
    },
  });
}

export function useUpdateGame() {
  const toast = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateGameFn = useServerFn($updateGame);

  return useMutation({
    mutationFn: async (data: UpdateGameInput) => await updateGameFn({ data }),
    onSuccess: async (_, data) => {
      toast.add({
        type: "success",
        title: "Game updated",
        description: "Your game has been updated successfully.",
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: gameQueries.getUpcomingGames().queryKey }),
        queryClient.invalidateQueries({ queryKey: gameQueries.getGame(data.gameId).queryKey }),
      ]);
      await router.navigate({ to: "/dashboard" });
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to update game",
        description: error instanceof Error ? error.message : "An error occurred while updating the game.",
      });
    },
  });
}

export function useJoinGame() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const joinGameFn = useServerFn($joinGame);

  return useMutation({
    mutationFn: async (gameId: string) => await joinGameFn({ data: { gameId } }),
    onSuccess: async (_, gameId) => {
      toast.add({
        type: "success",
        title: "Joined game",
        description: "You've successfully joined the game!",
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: gameQueries.getUpcomingGames().queryKey }),
        queryClient.invalidateQueries({ queryKey: gameQueries.getRecommendedGames().queryKey }),
        queryClient.invalidateQueries({ queryKey: gameQueries.getGameParticipants(gameId).queryKey }),
      ]);
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to join game",
        description: error instanceof Error ? error.message : "An error occurred while joining the game.",
      });
    },
  });
}

export function useLeaveGame() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const leaveGameFn = useServerFn($leaveGame);

  return useMutation({
    mutationFn: async (gameId: string) => await leaveGameFn({ data: { gameId } }),
    onSuccess: async (_, gameId) => {
      toast.add({
        type: "success",
        title: "Left game",
        description: "You've successfully left the game.",
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: gameQueries.getUpcomingGames().queryKey }),
        queryClient.invalidateQueries({ queryKey: gameQueries.getRecommendedGames().queryKey }),
        queryClient.invalidateQueries({ queryKey: gameQueries.getGameParticipants(gameId).queryKey }),
      ]);
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to leave game",
        description: error instanceof Error ? error.message : "An error occurred while leaving the game.",
      });
    },
  });
}

export function useCancelGame() {
  const toast = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const cancelGameFn = useServerFn($cancelGame);

  return useMutation({
    mutationFn: async (gameId: string) => await cancelGameFn({ data: { gameId } }),
    onSuccess: async (_, gameId) => {
      toast.add({
        type: "success",
        title: "Game cancelled",
        description: "The game has been cancelled successfully.",
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: gameQueries.getUpcomingGames().queryKey }),
        queryClient.invalidateQueries({ queryKey: gameQueries.getGameParticipants(gameId).queryKey }),
      ]);
      await router.navigate({ to: "/dashboard" });
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to cancel game",
        description: error instanceof Error ? error.message : "An error occurred while cancelling the game.",
      });
    },
  });
}
