import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useToast } from "@/hooks/use-toast";
import { userQueries } from "./queries";
import { $updateProfile, type ProfileFormInput } from "./update-profile";

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
