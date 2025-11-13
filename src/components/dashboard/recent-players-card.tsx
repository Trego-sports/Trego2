import { Link } from "@tanstack/react-router";
import { UserIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Friend {
  id: string;
  name: string;
  profilePictureUrl?: string;
  gamesTogether: number;
}

interface MyFriendsCardProps {
  friends: Friend[];
}

export function MyFriendsCard({ friends }: MyFriendsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4" />
          My Friends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <div key={friend.id} className="flex items-center gap-3 pb-3 border-b last:border-0 last:pb-0">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {friend.profilePictureUrl ? (
                    <img src={friend.profilePictureUrl} alt={friend.name} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{friend.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {friend.gamesTogether} {friend.gamesTogether === 1 ? "game" : "games"} together
                  </div>
                </div>
                <Link to="/users/$userId" params={{ userId: friend.id }}>
                  <Button variant="outline" size="sm" className="flex-shrink-0">
                    View
                  </Button>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-2">No friends yet. Play games to meet people!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
