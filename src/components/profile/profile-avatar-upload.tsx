import { UserIcon } from "lucide-react";
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
    <div className="flex flex-col items-center gap-3 sm:items-end">
      <div className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-muted">
        {displayedUrl ? (
          <img src={displayedUrl} alt={name} className="size-full object-cover" />
        ) : (
          <UserIcon className="size-12 text-muted-foreground" />
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
        <input
          ref={fileInputRef}
          type="file"
          accept={AVATAR_CONTENT_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadProfilePicture.isPending ? "Uploading..." : "Upload photo"}
        </Button>
        {profilePictureUrl && (
          <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={handleRemove}>
            {removeProfilePicture.isPending ? "Removing..." : "Remove"}
          </Button>
        )}
      </div>

      <p className="max-w-48 text-center text-xs text-muted-foreground sm:text-right">JPG, PNG, or WebP up to 2MB</p>
    </div>
  );
}
