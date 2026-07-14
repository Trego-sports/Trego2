import { CameraIcon, Trash2Icon, UserIcon } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AVATAR_CONTENT_TYPES, AVATAR_MAX_BYTES, isAvatarContentType, readFileAsBase64 } from "@/lib/avatars";
import { useRemoveProfilePicture, useUploadProfilePicture } from "@/modules/profile/mutations";

interface ProfileAvatarUploadProps {
  name: string;
  profilePictureUrl: string | null;
}

export function ProfileAvatarUpload({ name, profilePictureUrl }: ProfileAvatarUploadProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadProfilePicture = useUploadProfilePicture();
  const removeProfilePicture = useRemoveProfilePicture();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isPending = uploadProfilePicture.isPending || removeProfilePicture.isPending;
  const displayedUrl = previewUrl ?? profilePictureUrl;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!isAvatarContentType(file.type)) {
      toast.add({
        type: "error",
        title: "Unsupported image type",
        description: "Please upload a JPG, PNG, or WebP image.",
      });
      return;
    }

    if (file.size > AVATAR_MAX_BYTES) {
      toast.add({
        type: "error",
        title: "Image too large",
        description: "Profile pictures must be 2MB or smaller.",
      });
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));

    try {
      const fileBase64 = await readFileAsBase64(file);
      await uploadProfilePicture.mutateAsync({
        fileBase64,
        contentType: file.type,
      });
    } finally {
      setPreviewUrl((currentPreviewUrl) => {
        if (currentPreviewUrl) {
          URL.revokeObjectURL(currentPreviewUrl);
        }
        return null;
      });
    }
  };

  const handleRemove = async () => {
    await removeProfilePicture.mutateAsync();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex size-32 items-center justify-center overflow-hidden rounded-lg bg-[#dce9ff] shadow-[0_8px_24px_rgba(15,23,42,0.08)] outline outline-4 outline-white">
        {displayedUrl ? (
          <img src={displayedUrl} alt={name} className="size-full object-cover" />
        ) : (
          <UserIcon className="size-14 text-[#004ac6]" />
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={() => fileInputRef.current?.click()}
          className="absolute right-2 bottom-2 flex size-10 items-center justify-center rounded-lg border border-[#c3c6d7] bg-white text-[#38485d] shadow-sm transition hover:bg-[#eff4ff] hover:text-[#004ac6] active:scale-[0.96] disabled:pointer-events-none disabled:opacity-60"
          aria-label="Upload profile photo"
        >
          <CameraIcon className="size-4" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={AVATAR_CONTENT_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadProfilePicture.isPending ? "Uploading..." : "Upload"}
        </Button>
        {profilePictureUrl && (
          <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={handleRemove}>
            <Trash2Icon className="size-3.5" />
            {removeProfilePicture.isPending ? "Removing..." : "Remove"}
          </Button>
        )}
      </div>

      <p className="max-w-48 text-center text-xs font-medium text-[#647086]">JPG, PNG, or WebP up to 2MB</p>
    </div>
  );
}
