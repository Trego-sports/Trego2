import { Link } from "@tanstack/react-router";
import { MessageSquareIcon } from "lucide-react";
import { useState } from "react";
import { CommunityAuthorChip } from "@/components/community/community-author-chip";
import {
  CommunityDeleteDialog,
  CommunityEditPostDialog,
  CommunityOwnActions,
} from "@/components/community/community-dialogs";
import { formatAbsoluteTime, formatRelativeTime } from "@/components/community/format-time";
import {
  type CommunityPostSummary,
  DELETED_PLACEHOLDER,
  useDeleteCommunityPost,
  useUpdateCommunityPost,
} from "@/modules/community";

interface CommunityPostCardProps {
  post: CommunityPostSummary;
  preview?: boolean;
}

export function CommunityPostCard({ post, preview = false }: CommunityPostCardProps) {
  const updatePost = useUpdateCommunityPost();
  const deletePost = useDeleteCommunityPost();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isDeleted = Boolean(post.deletedAt);
  const title = isDeleted ? DELETED_PLACEHOLDER : post.title;
  const body = isDeleted ? DELETED_PLACEHOLDER : post.body;
  const canManage = post.author.relationship.isSelf && !isDeleted;

  return (
    <article className="rounded-lg border border-[#c3c6d7] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <CommunityAuthorChip author={post.author} />
        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <time
            className="text-xs font-semibold text-[#647086]"
            dateTime={new Date(post.createdAt).toISOString()}
            title={formatAbsoluteTime(post.createdAt)}
          >
            {formatRelativeTime(post.createdAt)}
          </time>
          {canManage && (
            <CommunityOwnActions
              onEdit={() => setEditOpen(true)}
              onDelete={() => setDeleteOpen(true)}
              disabled={updatePost.isPending || deletePost.isPending}
            />
          )}
        </div>
      </div>

      {preview ? (
        <Link to="/community/$postId" params={{ postId: post.id }} className="mt-4 block group">
          <h2 className="text-xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif] group-hover:text-[#004ac6]">
            {title}
          </h2>
          <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm font-medium leading-6 text-[#38485d]">{body}</p>
        </Link>
      ) : (
        <div className="mt-4">
          <h1 className="text-3xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
            {title}
          </h1>
          <p className="mt-3 whitespace-pre-wrap text-base font-medium leading-7 text-[#38485d]">{body}</p>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#647086]">
        <MessageSquareIcon className="size-4 text-[#004ac6]" />
        {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
      </div>

      <CommunityEditPostDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title={post.title}
        body={post.body}
        isPending={updatePost.isPending}
        onSave={async (data) => {
          await updatePost.mutateAsync({ postId: post.id, ...data });
        }}
      />
      <CommunityDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this post?"
        description="The post will show as [deleted]. Existing comments will stay on the thread, but new comments will be closed."
        isPending={deletePost.isPending}
        onConfirm={async () => {
          await deletePost.mutateAsync({ postId: post.id });
        }}
      />
    </article>
  );
}
