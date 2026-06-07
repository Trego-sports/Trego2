import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useToast } from "@/hooks/use-toast";
import { userQueries } from "./queries";
import { $removeProfilePicture } from "./remove-profile-picture";
import { $updateProfile, type ProfileFormInput } from "./update-profile";
import { $uploadProfilePicture, type UploadProfilePictureInput } from "./upload-profile-picture";

export function useUpdateProfile() {
  const toast = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateProfileFn = useServerFn($updateProfile);

  return useMutation({
    mutationFn: async (data: ProfileFormInput) => await updateProfileFn({ data }),
    onSuccess: async () => {
      toast.add({
        type: "success",
        title: "Profile saved",
        description: "Your profile has been updated successfully.",
      });
      await queryClient.invalidateQueries({ queryKey: userQueries.getMyProfile().queryKey });
      await router.navigate({ to: "/dashboard" });
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "An error occurred while updating your profile.",
      });
    },
  });
}

export function useUploadProfilePicture() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const uploadProfilePictureFn = useServerFn($uploadProfilePicture);

  return useMutation({
    mutationFn: async (data: UploadProfilePictureInput) => await uploadProfilePictureFn({ data }),
    onSuccess: async () => {
      toast.add({
        type: "success",
        title: "Profile picture updated",
        description: "Your new profile picture has been saved.",
      });
      await queryClient.invalidateQueries({ queryKey: userQueries.getMyProfile().queryKey });
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to upload profile picture",
        description: error instanceof Error ? error.message : "An error occurred while uploading your profile picture.",
      });
    },
  });
}

export function useRemoveProfilePicture() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const removeProfilePictureFn = useServerFn($removeProfilePicture);

  return useMutation({
    mutationFn: async () => await removeProfilePictureFn(),
    onSuccess: async () => {
      toast.add({
        type: "success",
        title: "Profile picture removed",
        description: "Your profile picture has been removed.",
      });
      await queryClient.invalidateQueries({ queryKey: userQueries.getMyProfile().queryKey });
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "Failed to remove profile picture",
        description: error instanceof Error ? error.message : "An error occurred while removing your profile picture.",
      });
    },
  });
}
