import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, ErrorComponent, Link } from "@tanstack/react-router";
import { CheckIcon, SearchIcon, SendIcon, UserIcon, UserPlusIcon, UsersIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  friendQueries,
  useCancelFriendRequest,
  useRespondFriendRequest,
  useSendFriendRequest,
} from "@/modules/friends";

export const Route = createFileRoute("/_authed/friends")({
  component: FriendsPage,
  errorComponent: ErrorComponent,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(friendQueries.getFriendRequests());
    context.queryClient.ensureQueryData(friendQueries.getMyFriends());
  },
});

function FriendsPage() {
  const { data: friendRequests } = useSuspenseQuery(friendQueries.getFriendRequests());
  const { data: friends } = useSuspenseQuery(friendQueries.getMyFriends());
  const [searchInput, setSearchInput] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [requestMessages, setRequestMessages] = useState<Record<string, string>>({});

  const searchQuery = useQuery(friendQueries.searchUsers({ query: submittedSearch }));
  const sendFriendRequest = useSendFriendRequest();
  const respondFriendRequest = useRespondFriendRequest();
  const cancelFriendRequest = useCancelFriendRequest();

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedSearch(searchInput.trim());
  };

  const handleSendRequest = async (recipientUserId: string) => {
    const requestMessage = requestMessages[recipientUserId]?.trim();
    await sendFriendRequest.mutateAsync({
      recipientUserId,
      requestMessage: requestMessage || undefined,
    });
    setRequestMessages((current) => ({ ...current, [recipientUserId]: "" }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Friends</h1>
          <p className="text-muted-foreground">Manage friend requests and accepted friends</p>
        </div>
        <Link to="/dashboard">
          <Button variant="outline">Dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlusIcon className="h-5 w-5" />
            Add Friend
          </CardTitle>
          <CardDescription>Search by name or email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search users..."
              leadingIcon={<SearchIcon />}
            />
            <Button type="submit" disabled={searchInput.trim().length < 2 || searchQuery.isFetching}>
              <SearchIcon />
              Search
            </Button>
          </form>

          {submittedSearch.trim().length >= 2 && (
            <div className="space-y-4">
              {searchQuery.isFetching && <p className="text-sm text-muted-foreground">Searching...</p>}

              {!searchQuery.isFetching && searchQuery.data?.length === 0 && (
                <p className="text-sm text-muted-foreground">No users found.</p>
              )}

              {searchQuery.data?.map((user) => (
                <div key={user.userId} className="border p-4 transition-colors hover:bg-muted/35">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <UserSummary
                      name={user.name}
                      email={user.email}
                      profilePictureUrl={user.profilePictureUrl}
                      subtitle={user.isFriend ? "Friend" : undefined}
                    />

                    <SearchResultAction
                      user={user}
                      requestMessage={requestMessages[user.userId] ?? ""}
                      onRequestMessageChange={(message) =>
                        setRequestMessages((current) => ({ ...current, [user.userId]: message }))
                      }
                      onSendRequest={() => handleSendRequest(user.userId)}
                      onAccept={() =>
                        user.incomingRequest &&
                        respondFriendRequest.mutate({
                          friendRequestId: user.incomingRequest.id,
                          action: "accept",
                        })
                      }
                      onDecline={() =>
                        user.incomingRequest &&
                        respondFriendRequest.mutate({
                          friendRequestId: user.incomingRequest.id,
                          action: "decline",
                        })
                      }
                      onCancel={() =>
                        user.outgoingRequest && cancelFriendRequest.mutate({ friendRequestId: user.outgoingRequest.id })
                      }
                      isMutating={
                        sendFriendRequest.isPending || respondFriendRequest.isPending || cancelFriendRequest.isPending
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Incoming Requests</CardTitle>
            <CardDescription>People waiting for your response</CardDescription>
          </CardHeader>
          <CardContent>
            {friendRequests.incoming.length > 0 ? (
              <div className="space-y-4">
                {friendRequests.incoming.map((request) => (
                  <div key={request.id} className="border p-4 transition-colors hover:bg-muted/35">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <UserSummary
                        name={request.requesterName}
                        email={request.requesterEmail}
                        profilePictureUrl={request.requesterProfilePictureUrl}
                        message={request.requestMessage}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => respondFriendRequest.mutate({ friendRequestId: request.id, action: "accept" })}
                          disabled={respondFriendRequest.isPending}
                        >
                          <CheckIcon />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            respondFriendRequest.mutate({ friendRequestId: request.id, action: "decline" })
                          }
                          disabled={respondFriendRequest.isPending}
                        >
                          <XIcon />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No incoming requests.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outgoing Requests</CardTitle>
            <CardDescription>Requests you sent</CardDescription>
          </CardHeader>
          <CardContent>
            {friendRequests.outgoing.length > 0 ? (
              <div className="space-y-4">
                {friendRequests.outgoing.map((request) => (
                  <div key={request.id} className="border p-4 transition-colors hover:bg-muted/35">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <UserSummary
                        name={request.recipientName}
                        email={request.recipientEmail}
                        profilePictureUrl={request.recipientProfilePictureUrl}
                        message={request.requestMessage}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelFriendRequest.mutate({ friendRequestId: request.id })}
                        disabled={cancelFriendRequest.isPending}
                      >
                        <XIcon />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No outgoing requests.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Friends
          </CardTitle>
          <CardDescription>Accepted friends</CardDescription>
        </CardHeader>
        <CardContent>
          {friends.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {friends.map((friend) => (
                <div
                  key={friend.userId}
                  className="flex items-center justify-between gap-4 border p-4 transition-colors hover:bg-muted/35"
                >
                  <UserSummary
                    name={friend.name}
                    email={friend.email}
                    profilePictureUrl={friend.profilePictureUrl}
                    subtitle={`Friends since ${new Intl.DateTimeFormat(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(friend.friendsSince))}`}
                  />
                  <div className="flex items-center gap-2">
                    {friend.unreadCount > 0 && (
                      <span className="flex h-6 min-w-6 items-center justify-center bg-destructive px-2 font-medium text-destructive-foreground text-xs">
                        {friend.unreadCount}
                      </span>
                    )}
                    <Button size="sm" render={<Link to="/friends/$userId" params={{ userId: friend.userId }} />}>
                      Chat
                    </Button>
                    <Link to="/users/$userId" params={{ userId: friend.userId }}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No accepted friends yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface UserSummaryProps {
  name: string;
  email?: string | null;
  profilePictureUrl?: string | null;
  subtitle?: string;
  message?: string | null;
}

function UserSummary({ name, email, profilePictureUrl, subtitle, message }: UserSummaryProps) {
  return (
    <div className="flex min-w-0 gap-3">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden border bg-muted">
        {profilePictureUrl ? (
          <img src={profilePictureUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <UserIcon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium">{name}</p>
        {email && <p className="truncate text-sm text-muted-foreground">{email}</p>}
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        {message && <p className="mt-3 border-l-4 pl-3 text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}

interface SearchResultActionProps {
  user: {
    isFriend: boolean;
    outgoingRequest: { id: string; requestMessage: string | null; status: string } | null;
    incomingRequest: { id: string; requestMessage: string | null; status: string } | null;
  };
  requestMessage: string;
  onRequestMessageChange: (message: string) => void;
  onSendRequest: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onCancel: () => void;
  isMutating: boolean;
}

function SearchResultAction({
  user,
  requestMessage,
  onRequestMessageChange,
  onSendRequest,
  onAccept,
  onDecline,
  onCancel,
  isMutating,
}: SearchResultActionProps) {
  if (user.isFriend) {
    return <p className="text-sm font-medium text-muted-foreground">Already friends</p>;
  }

  if (user.outgoingRequest?.status === "pending") {
    return (
      <div className="flex flex-col items-start gap-3 lg:items-end">
        {user.outgoingRequest.requestMessage && (
          <p className="max-w-sm border-l-4 pl-3 text-sm text-muted-foreground">
            {user.outgoingRequest.requestMessage}
          </p>
        )}
        <Button size="sm" variant="outline" onClick={onCancel} disabled={isMutating}>
          <XIcon />
          Cancel Request
        </Button>
      </div>
    );
  }

  if (user.incomingRequest?.status === "pending") {
    return (
      <div className="flex flex-col items-start gap-3 lg:items-end">
        {user.incomingRequest.requestMessage && (
          <p className="max-w-sm border-l-4 pl-3 text-sm text-muted-foreground">
            {user.incomingRequest.requestMessage}
          </p>
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={onAccept} disabled={isMutating}>
            <CheckIcon />
            Accept
          </Button>
          <Button size="sm" variant="outline" onClick={onDecline} disabled={isMutating}>
            <XIcon />
            Decline
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 lg:max-w-sm">
      <Label htmlFor="friend-request-message">Message</Label>
      <textarea
        id="friend-request-message"
        value={requestMessage}
        onChange={(event) => onRequestMessageChange(event.target.value)}
        maxLength={280}
        rows={3}
        className={cn(
          "w-full resize-none border bg-input px-3 py-2 text-sm outline-none",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
        placeholder="Optional message..."
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{requestMessage.length}/280</p>
        <Button size="sm" onClick={onSendRequest} disabled={isMutating}>
          <SendIcon />
          Send Request
        </Button>
      </div>
    </div>
  );
}
