import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckIcon, MessageSquareIcon, UserPlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CommunityAuthor } from "@/modules/community";
import { useCancelFriendRequest, useRespondFriendRequest, useSendFriendRequest } from "@/modules/friends";

interface CommunityAuthorChipProps {
  author: CommunityAuthor;
  compact?: boolean;
}

export function CommunityAuthorChip({ author, compact = false }: CommunityAuthorChipProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", compact && "gap-2")}>
      <Link
        to="/users/$userId"
        params={{ userId: author.userId }}
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#dce9ff] font-bold text-[#004ac6]",
          compact ? "size-8 text-xs" : "size-10 text-sm",
        )}
      >
        {author.profilePictureUrl ? (
          <img src={author.profilePictureUrl} alt={author.name} className="size-full object-cover" />
        ) : (
          author.name[0]
        )}
      </Link>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/users/$userId"
            params={{ userId: author.userId }}
            className="truncate font-bold text-[#0b1c30] hover:text-[#004ac6]"
          >
            {author.name}
          </Link>
          {author.relationship.isSelf && (
            <span className="rounded-full bg-[#e5eeff] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#004ac6]">
              You
            </span>
          )}
        </div>
        <AuthorActions author={author} />
      </div>
    </div>
  );
}

function AuthorActions({ author }: { author: CommunityAuthor }) {
  const queryClient = useQueryClient();
  const sendFriendRequest = useSendFriendRequest();
  const respondFriendRequest = useRespondFriendRequest();
  const cancelFriendRequest = useCancelFriendRequest();
  const isMutating = sendFriendRequest.isPending || respondFriendRequest.isPending || cancelFriendRequest.isPending;

  const invalidateCommunity = async () => {
    await queryClient.invalidateQueries({ queryKey: ["community"] });
  };

  if (author.relationship.isSelf) {
    return null;
  }

  if (author.relationship.isFriend) {
    return (
      <Button
        size="sm"
        variant="ghost"
        className="mt-1 h-7 px-2 text-xs"
        render={<Link to="/friends/$userId" params={{ userId: author.userId }} />}
      >
        <MessageSquareIcon />
        Message
      </Button>
    );
  }

  if (author.relationship.incomingRequest) {
    const incomingRequest = author.relationship.incomingRequest;
    return (
      <div className="mt-1 flex flex-wrap gap-1">
        <Button
          size="sm"
          className="h-7 px-2 text-xs"
          disabled={isMutating}
          onClick={async () => {
            await respondFriendRequest.mutateAsync({
              friendRequestId: incomingRequest.id,
              action: "accept",
            });
            await invalidateCommunity();
          }}
        >
          <CheckIcon />
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs"
          disabled={isMutating}
          onClick={async () => {
            await respondFriendRequest.mutateAsync({
              friendRequestId: incomingRequest.id,
              action: "decline",
            });
            await invalidateCommunity();
          }}
        >
          <XIcon />
          Decline
        </Button>
      </div>
    );
  }

  if (author.relationship.outgoingRequest) {
    const outgoingRequest = author.relationship.outgoingRequest;
    return (
      <Button
        size="sm"
        variant="outline"
        className="mt-1 h-7 px-2 text-xs"
        disabled={isMutating}
        onClick={async () => {
          await cancelFriendRequest.mutateAsync({
            friendRequestId: outgoingRequest.id,
          });
          await invalidateCommunity();
        }}
      >
        <XIcon />
        Cancel request
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="mt-1 h-7 px-2 text-xs"
      disabled={isMutating}
      onClick={async () => {
        await sendFriendRequest.mutateAsync({ recipientUserId: author.userId });
        await invalidateCommunity();
      }}
    >
      <UserPlusIcon />
      Add friend
    </Button>
  );
}
