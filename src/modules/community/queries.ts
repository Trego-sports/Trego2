import { queryOptions } from "@tanstack/react-query";
import { $getCommunityPost, type GetCommunityPostInput } from "./get-community-post";
import { $getCommunityPosts } from "./get-community-posts";

export const communityQueries = {
  getPosts: () =>
    queryOptions({
      queryKey: ["community", "posts"],
      queryFn: async () => await $getCommunityPosts(),
    }),

  getPost: (data: GetCommunityPostInput) =>
    queryOptions({
      queryKey: ["community", "post", data.postId],
      queryFn: async () => await $getCommunityPost({ data }),
    }),
};
