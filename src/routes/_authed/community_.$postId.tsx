import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, ErrorComponent, Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { CommunityCommentList } from "@/components/community/community-comment-list";
import { textareaClassName } from "@/components/community/community-dialogs";
import { CommunityPostCard } from "@/components/community/community-post-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { communityQueries, useCreateCommunityComment } from "@/modules/community";

export const Route = createFileRoute("/_authed/community_/$postId")({
  component: CommunityPostPage,
  errorComponent: ErrorComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(communityQueries.getPost({ postId: params.postId }));
  },
});

function CommunityPostPage() {
  const { postId } = Route.useParams();
  const { data: post } = useSuspenseQuery(communityQueries.getPost({ postId }));
  const isDeleted = Boolean(post.deletedAt);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link to="/community" className="inline-flex items-center gap-2 text-sm font-bold text-[#004ac6] hover:underline">
        <ArrowLeftIcon className="size-4" />
        Back to community
      </Link>

      <CommunityPostCard post={post} />

      <section className="space-y-4">
        <h2 className="text-2xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
          Comments
        </h2>
        {isDeleted ? (
          <p className="rounded-lg border border-[#d8def0] bg-[#f8f9ff] px-4 py-3 text-sm font-medium text-[#647086]">
            This post is deleted, so new comments are closed. Existing comments are still visible.
          </p>
        ) : (
          <CommentComposer postId={post.id} />
        )}
        <CommunityCommentList postId={post.id} comments={post.comments} postDeleted={isDeleted} />
      </section>
    </div>
  );
}

function CommentComposer({ postId }: { postId: string }) {
  const createComment = useCreateCommunityComment();
  const [body, setBody] = useState("");
  const trimmedBody = body.trim();

  return (
    <form
      className="space-y-3 rounded-lg border border-[#c3c6d7] bg-white p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (trimmedBody.length === 0 || createComment.isPending) {
          return;
        }
        await createComment.mutateAsync({ postId, body: trimmedBody });
        setBody("");
      }}
    >
      <Label htmlFor="community-comment-body">Add a comment</Label>
      <textarea
        id="community-comment-body"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={4}
        placeholder="I'm free Tuesday after 5 if that works..."
        className={textareaClassName}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={trimmedBody.length === 0 || createComment.isPending}>
          Comment
        </Button>
      </div>
    </form>
  );
}
