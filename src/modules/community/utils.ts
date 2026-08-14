import { and, eq, inArray, or } from "drizzle-orm";
import { friendRequestsTable, friendshipsTable } from "@/db/tables";
import type { DBContext } from "@/lib/middleware/db";
import type { CommunityAuthor, CommunityAuthorRelationship } from "./types";

type RelationshipDb = Pick<DBContext, "select">;

export function emptyAuthorRelationship(isSelf = false): CommunityAuthorRelationship {
  return {
    isSelf,
    isFriend: false,
    outgoingRequest: null,
    incomingRequest: null,
  };
}

export async function getAuthorRelationships(
  db: RelationshipDb,
  currentUserId: string,
  authorUserIds: string[],
): Promise<Map<string, CommunityAuthorRelationship>> {
  const relationships = new Map<string, CommunityAuthorRelationship>();
  const uniqueAuthorIds = [...new Set(authorUserIds)];
  const otherUserIds = uniqueAuthorIds.filter((userId) => userId !== currentUserId);

  for (const authorUserId of uniqueAuthorIds) {
    relationships.set(authorUserId, emptyAuthorRelationship(authorUserId === currentUserId));
  }

  if (otherUserIds.length === 0) {
    return relationships;
  }

  const friendshipRows = await db
    .select({
      userAId: friendshipsTable.userAId,
      userBId: friendshipsTable.userBId,
    })
    .from(friendshipsTable)
    .where(
      or(
        and(eq(friendshipsTable.userAId, currentUserId), inArray(friendshipsTable.userBId, otherUserIds)),
        and(eq(friendshipsTable.userBId, currentUserId), inArray(friendshipsTable.userAId, otherUserIds)),
      ),
    );

  for (const row of friendshipRows) {
    const friendUserId = row.userAId === currentUserId ? row.userBId : row.userAId;
    const current = relationships.get(friendUserId) ?? emptyAuthorRelationship();
    relationships.set(friendUserId, { ...current, isFriend: true });
  }

  const requestRows = await db
    .select({
      id: friendRequestsTable.id,
      requesterUserId: friendRequestsTable.requesterUserId,
      recipientUserId: friendRequestsTable.recipientUserId,
    })
    .from(friendRequestsTable)
    .where(
      and(
        eq(friendRequestsTable.status, "pending"),
        or(
          and(
            eq(friendRequestsTable.requesterUserId, currentUserId),
            inArray(friendRequestsTable.recipientUserId, otherUserIds),
          ),
          and(
            eq(friendRequestsTable.recipientUserId, currentUserId),
            inArray(friendRequestsTable.requesterUserId, otherUserIds),
          ),
        ),
      ),
    );

  for (const row of requestRows) {
    if (row.requesterUserId === currentUserId) {
      const current = relationships.get(row.recipientUserId) ?? emptyAuthorRelationship();
      relationships.set(row.recipientUserId, { ...current, outgoingRequest: { id: row.id } });
      continue;
    }

    const current = relationships.get(row.requesterUserId) ?? emptyAuthorRelationship();
    relationships.set(row.requesterUserId, { ...current, incomingRequest: { id: row.id } });
  }

  return relationships;
}

export function toCommunityAuthor(
  user: { userId: string; name: string; profilePictureUrl: string | null },
  relationships: Map<string, CommunityAuthorRelationship>,
): CommunityAuthor {
  return {
    userId: user.userId,
    name: user.name,
    profilePictureUrl: user.profilePictureUrl,
    relationship: relationships.get(user.userId) ?? emptyAuthorRelationship(),
  };
}
