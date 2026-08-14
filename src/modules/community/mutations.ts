import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useToast } from "@/hooks/use-toast";
import { $createCommunityComment, type CreateCommunityCommentInput } from "./create-community-comment";
import { $createCommunityPost, type CreateCommunityPostInput } from "./create-community-post";
import { $deleteCommunityComment, type DeleteCommunityCommentInput } from "./delete-community-comment";
import { $deleteCommunityPost, type DeleteCommunityPostInput } from "./delete-community-post";
import { $updateCommunityComment, type UpdateCommunityCommentInput } from "./update-community-comment";
import { $updateCommunityPost, type UpdateCommunityPostInput } from "./update-community-post";

function useInvalidateCommunityQueries() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: ["community"] });
  };
}

export function useCreateCommunityPost() {
  const toast = useToast();
  const invalidateCommunityQueries = useInvalidateCommunityQueries();
  const createCommunityPostFn = useServerFn($createCommunityPost);

  return useMutation({
    mutationFn: async (data: CreateCommunityPostInput) => await createCommunityPostFn({ data }),
    onSuccess: async () => {
      toast.add({
        type: "success",
        title: "Post published",
        description: "Your discussion is now visible to the community.",
      });
      await invalidateCommunityQueries();
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to publish post",
        description: error instanceof Error ? error.message : "An error occurred while publishing the post.",
      });
    },
  });
}

export function useUpdateCommunityPost() {
  const toast = useToast();
  const invalidateCommunityQueries = useInvalidateCommunityQueries();
  const updateCommunityPostFn = useServerFn($updateCommunityPost);

  return useMutation({
    mutationFn: async (data: UpdateCommunityPostInput) => await updateCommunityPostFn({ data }),
    onSuccess: async () => {
      toast.add({
        type: "success",
        title: "Post updated",
        description: "Your changes have been saved.",
      });
      await invalidateCommunityQueries();
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to update post",
        description: error instanceof Error ? error.message : "An error occurred while updating the post.",
      });
    },
  });
}

export function useDeleteCommunityPost() {
  const toast = useToast();
  const invalidateCommunityQueries = useInvalidateCommunityQueries();
  const deleteCommunityPostFn = useServerFn($deleteCommunityPost);

  return useMutation({
    mutationFn: async (data: DeleteCommunityPostInput) => await deleteCommunityPostFn({ data }),
    onSuccess: async () => {
      toast.add({
        type: "success",
        title: "Post deleted",
        description: "Existing comments are still available on the post page.",
      });
      await invalidateCommunityQueries();
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to delete post",
        description: error instanceof Error ? error.message : "An error occurred while deleting the post.",
      });
    },
  });
}

export function useCreateCommunityComment() {
  const toast = useToast();
  const invalidateCommunityQueries = useInvalidateCommunityQueries();
  const createCommunityCommentFn = useServerFn($createCommunityComment);

  return useMutation({
    mutationFn: async (data: CreateCommunityCommentInput) => await createCommunityCommentFn({ data }),
    onSuccess: async () => {
      await invalidateCommunityQueries();
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to post comment",
        description: error instanceof Error ? error.message : "An error occurred while posting the comment.",
      });
    },
  });
}

export function useUpdateCommunityComment() {
  const toast = useToast();
  const invalidateCommunityQueries = useInvalidateCommunityQueries();
  const updateCommunityCommentFn = useServerFn($updateCommunityComment);

  return useMutation({
    mutationFn: async (data: UpdateCommunityCommentInput) => await updateCommunityCommentFn({ data }),
    onSuccess: async () => {
      toast.add({
        type: "success",
        title: "Comment updated",
        description: "Your changes have been saved.",
      });
      await invalidateCommunityQueries();
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to update comment",
        description: error instanceof Error ? error.message : "An error occurred while updating the comment.",
      });
    },
  });
}

export function useDeleteCommunityComment() {
  const toast = useToast();
  const invalidateCommunityQueries = useInvalidateCommunityQueries();
  const deleteCommunityCommentFn = useServerFn($deleteCommunityComment);

  return useMutation({
    mutationFn: async (data: DeleteCommunityCommentInput) => await deleteCommunityCommentFn({ data }),
    onSuccess: async () => {
      toast.add({
        type: "success",
        title: "Comment deleted",
        description: "Replies to this comment are still visible.",
      });
      await invalidateCommunityQueries();
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to delete comment",
        description: error instanceof Error ? error.message : "An error occurred while deleting the comment.",
      });
    },
  });
}
