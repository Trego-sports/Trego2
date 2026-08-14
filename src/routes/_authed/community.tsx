import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import { MessagesSquareIcon } from "lucide-react";
import { CommunityPostCard } from "@/components/community/community-post-card";
import { CommunityPostComposer } from "@/components/community/community-post-composer";
import { communityQueries } from "@/modules/community";

export const Route = createFileRoute("/_authed/community")({
  component: CommunityPage,
  errorComponent: ErrorComponent,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(communityQueries.getPosts());
  },
});

function CommunityPage() {
  const { data: posts } = useSuspenseQuery(communityQueries.getPosts());

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <p className="text-sm font-black uppercase tracking-[0.08em] text-[#004ac6]">Community</p>
        <h1 className="mt-1 text-4xl font-black tracking-tight text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
          Find people to play
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#647086]">
          Don&apos;t have a fixed time yet? Post your availability, sport, or preferences and coordinate in the
          comments. Once you agree, you can still create a game from the dashboard.
        </p>
      </header>

      <CommunityPostComposer />

      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <CommunityPostCard key={post.id} post={post} preview />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[#c3c6d7] bg-white p-10 text-center">
          <MessagesSquareIcon className="mx-auto size-10 text-[#c3c6d7]" />
          <p className="mt-3 font-black text-[#0b1c30]">No discussions yet</p>
          <p className="mt-1 text-sm font-medium text-[#647086]">
            Be the first to post — for example, “Looking for someone to play tennis this week.”
          </p>
        </div>
      )}
    </div>
  );
}
