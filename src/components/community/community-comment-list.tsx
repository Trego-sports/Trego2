import { CornerDownRightIcon } from "lucide-react";
import { useState } from "react";
import { CommunityAuthorChip } from "@/components/community/community-author-chip";
import {
  CommunityDeleteDialog,
  CommunityEditCommentDialog,
  CommunityOwnActions,
  textareaClassName,
} from "@/components/community/community-dialogs";
import { formatAbsoluteTime, formatRelativeTime } from "@/components/community/format-time";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  type CommunityComment,
  DELETED_PLACEHOLDER,
  useCreateCommunityComment,
  useDeleteCommunityComment,
  useUpdateCommunityComment,
} from "@/modules/community";

interface CommunityCommentListProps {
  postId: string;
  comments: CommunityComment[];
  postDeleted: boolean;
}

export function CommunityCommentList({ postId, comments, postDeleted }: CommunityCommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#c3c6d7] bg-[#f8f9ff] p-8 text-center">
        <p className="font-black text-[#0b1c30]">No comments yet</p>
        <p className="mt-1 text-sm font-medium text-[#647086]">Be the first to coordinate a time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} postId={postId} comment={comment} postDeleted={postDeleted} />
      ))}
    </div>
  );
}

function CommentItem({
  postId,
  comment,
  postDeleted,
}: {
  postId: string;
  comment: CommunityComment;
  postDeleted: boolean;
}) {
  const updateComment = useUpdateCommunityComment();
  const deleteComment = useDeleteCommunityComment();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isDeleted = Boolean(comment.deletedAt);
  const canManage = comment.author.relationship.isSelf && !isDeleted;
  const canReply = !postDeleted && !isDeleted;

  return (
    <article className="rounded-lg border border-[#d8def0] bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <CommunityAuthorChip author={comment.author} compact />
        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <time
            className="text-xs font-semibold text-[#647086]"
            dateTime={new Date(comment.createdAt).toISOString()}
            title={formatAbsoluteTime(comment.createdAt)}
          >
            {formatRelativeTime(comment.createdAt)}
          </time>
          {canManage && (
            <CommunityOwnActions
              onEdit={() => setEditOpen(true)}
              onDelete={() => setDeleteOpen(true)}
              disabled={updateComment.isPending || deleteComment.isPending}
            />
          )}
        </div>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-6 text-[#38485d]">
        {isDeleted ? DELETED_PLACEHOLDER : comment.body}
      </p>

      {canReply && <ReplyComposer postId={postId} parentCommentId={comment.id} />}

      {comment.replies.length > 0 && (
        <div className="mt-4 space-y-3 border-l-2 border-[#d8def0] pl-4">
          {comment.replies.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} />
          ))}
        </div>
      )}

      <CommunityEditCommentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        body={comment.body}
        isPending={updateComment.isPending}
        onSave={async (body) => {
          await updateComment.mutateAsync({ commentId: comment.id, body });
        }}
      />
      <CommunityDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this comment?"
        description="The comment will show as [deleted]. Existing replies will stay visible."
        isPending={deleteComment.isPending}
        onConfirm={async () => {
          await deleteComment.mutateAsync({ commentId: comment.id });
        }}
      />
    </article>
  );
}

function ReplyItem({ reply }: { reply: CommunityComment }) {
  const updateComment = useUpdateCommunityComment();
  const deleteComment = useDeleteCommunityComment();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const isDeleted = Boolean(reply.deletedAt);
  const canManage = reply.author.relationship.isSelf && !isDeleted;

  return (
    <article className="rounded-lg bg-[#f8f9ff] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <CommunityAuthorChip author={reply.author} compact />
        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <time
            className="text-xs font-semibold text-[#647086]"
            dateTime={new Date(reply.createdAt).toISOString()}
            title={formatAbsoluteTime(reply.createdAt)}
          >
            {formatRelativeTime(reply.createdAt)}
          </time>
          {canManage && (
            <CommunityOwnActions
              onEdit={() => setEditOpen(true)}
              onDelete={() => setDeleteOpen(true)}
              disabled={updateComment.isPending || deleteComment.isPending}
            />
          )}
        </div>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6 text-[#38485d]">
        {isDeleted ? DELETED_PLACEHOLDER : reply.body}
      </p>
      <CommunityEditCommentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        body={reply.body}
        isPending={updateComment.isPending}
        onSave={async (body) => {
          await updateComment.mutateAsync({ commentId: reply.id, body });
        }}
      />
      <CommunityDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this reply?"
        description="The reply will show as [deleted]."
        isPending={deleteComment.isPending}
        onConfirm={async () => {
          await deleteComment.mutateAsync({ commentId: reply.id });
        }}
      />
    </article>
  );
}

function ReplyComposer({ postId, parentCommentId }: { postId: string; parentCommentId: string }) {
  const createComment = useCreateCommunityComment();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const trimmedBody = body.trim();

  if (!open) {
    return (
      <Button size="sm" variant="ghost" className="mt-3 h-8 px-2" onClick={() => setOpen(true)}>
        <CornerDownRightIcon />
        Reply
      </Button>
    );
  }

  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={async (event) => {
        event.preventDefault();
        if (trimmedBody.length === 0 || createComment.isPending) {
          return;
        }
        await createComment.mutateAsync({ postId, parentCommentId, body: trimmedBody });
        setBody("");
        setOpen(false);
      }}
    >
      <Label htmlFor={`reply-${parentCommentId}`} className="sr-only">
        Reply
      </Label>
      <textarea
        id={`reply-${parentCommentId}`}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={3}
        placeholder="Reply to coordinate a time..."
        className={textareaClassName}
      />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setOpen(false);
            setBody("");
          }}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={trimmedBody.length === 0 || createComment.isPending}>
          Reply
        </Button>
      </div>
    </form>
  );
}
