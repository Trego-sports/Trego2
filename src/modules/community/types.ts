export const COMMUNITY_FEED_LIMIT = 100;
export const DELETED_PLACEHOLDER = "[deleted]";

export interface CommunityAuthorRelationship {
  isSelf: boolean;
  isFriend: boolean;
  outgoingRequest: { id: string } | null;
  incomingRequest: { id: string } | null;
}

export interface CommunityAuthor {
  userId: string;
  name: string;
  profilePictureUrl: string | null;
  relationship: CommunityAuthorRelationship;
}

export interface CommunityPostSummary {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  commentCount: number;
  author: CommunityAuthor;
}

export interface CommunityComment {
  id: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: CommunityAuthor;
  replies: CommunityComment[];
}

export interface CommunityPostDetail extends CommunityPostSummary {
  comments: CommunityComment[];
}
