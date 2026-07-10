import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, ErrorComponent, Link } from "@tanstack/react-router";
import { SendIcon, UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { friendQueries, useSendFriendMessage } from "@/modules/friends";

export const Route = createFileRoute("/_authed/friends_/$userId")({
  component: FriendChatPage,
  errorComponent: ErrorComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(friendQueries.getFriendChat({ friendUserId: params.userId }));
  },
});

function formatMessageTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function FriendChatPage() {
  const { userId } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: chat } = useSuspenseQuery(friendQueries.getFriendChat({ friendUserId: userId }));
  const sendFriendMessage = useSendFriendMessage();
  const [body, setBody] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: friendQueries.getMyFriends().queryKey });
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [queryClient]);

  const trimmedBody = body.trim();

  const handleSend = async () => {
    if (!trimmedBody) {
      return;
    }

    await sendFriendMessage.mutateAsync({
      friendUserId: userId,
      body: trimmedBody,
    });
    setBody("");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden border bg-muted">
            {chat.friend.profilePictureUrl ? (
              <img src={chat.friend.profilePictureUrl} alt={chat.friend.name} className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-bold tracking-tight">{chat.friend.name}</h1>
            <p className="truncate text-muted-foreground">{chat.friend.email}</p>
          </div>
        </div>
        <Link to="/friends">
          <Button variant="outline">Friends</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chat</CardTitle>
          <CardDescription>Direct messages are available after both users become friends.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {chat.messages.length > 0 ? (
            <div className="max-h-[520px] space-y-4 overflow-y-auto border bg-muted/20 p-4">
              {chat.messages.map((message) => (
                <div key={message.id} className={cn("space-y-1", message.isMine ? "text-right" : "text-left")}>
                  <p className="text-xs font-medium text-muted-foreground">
                    {message.isMine ? "You" : message.senderName} · {formatMessageTime(message.createdAt)}
                  </p>
                  <p
                    className={cn(
                      "inline-block max-w-[80%] whitespace-pre-wrap px-3 py-2 text-left text-sm leading-6",
                      message.isMine ? "border bg-primary/10" : "border bg-card",
                    )}
                  >
                    {message.body}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="border p-8 text-center text-sm text-muted-foreground">No messages yet.</div>
          )}

          <div className="space-y-2">
            <label htmlFor="friend-message-body" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="friend-message-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              rows={4}
              maxLength={2000}
              placeholder="Type your message..."
              className={cn(
                "placeholder:text-muted-foreground bg-input flex min-h-24 w-full resize-y border px-3 py-2 text-base transition-[color,box-shadow,border-color] outline-none md:text-sm",
                "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">{body.length}/2000</p>
              <Button onClick={handleSend} disabled={!trimmedBody || sendFriendMessage.isPending}>
                <SendIcon />
                {sendFriendMessage.isPending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
