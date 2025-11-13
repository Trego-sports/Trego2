import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import { CalendarIcon, MapPinIcon, UserIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { userQueries } from "@/modules/profile/queries";

export const Route = createFileRoute("/_authed/users/$userId")({
  component: UserViewPage,
  errorComponent: ErrorComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(userQueries.getUserProfile(params.userId));
  },
});

function UserViewPage() {
  const { userId } = Route.useParams();
  const { data: profile } = useSuspenseQuery(userQueries.getUserProfile(userId));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Player Profile</h1>
        <p className="text-muted-foreground">View player information and game history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="h-24 w-24 flex items-center justify-center bg-muted rounded-full flex-shrink-0">
              {profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt={profile.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <UserIcon className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-lg font-semibold">{profile.name}</p>
              </div>
              {profile.sports.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Sports</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.sports.map((sport) => (
                      <div
                        key={`${sport.sport}-${sport.skillLevel}`}
                        className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md"
                      >
                        <span className="text-sm font-medium">{sport.sport}</span>
                        <span className="text-xs text-muted-foreground">({sport.skillLevel})</span>
                        {sport.position && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{sport.position}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {profile.games && profile.games.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Games</CardTitle>
            <CardDescription>All games this player has participated in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.games.map((game) => (
                <div key={game.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{game.title}</span>
                      <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground">{game.sport}</span>
                      {game.isHost && (
                        <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground font-medium">Host</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>
                          {game.scheduledAt.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3" />
                        <span>{game.locationName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Host: {game.hostName}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
