import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  NavigationIcon,
  PlusCircleIcon,
  SettingsIcon,
  UserMinusIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeaveGame } from "@/modules/games/mutations";
import { gameQueries } from "@/modules/games/queries";
import { ViewPlayersDialog } from "./view-players-dialog";

export function NextGameCard() {
  const leaveMutation = useLeaveGame();
  const [showPlayersDialog, setShowPlayersDialog] = useState(false);
  const { data: upcomingGames } = useSuspenseQuery(gameQueries.getUpcomingGames());

  const nextGame = upcomingGames?.[0];

  // Show empty state if no game
  if (!nextGame) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ClockIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Upcoming Games</h3>
          <p className="text-sm text-muted-foreground mb-4">Join a game or create one to get started!</p>
          <Link to="/games/create">
            <Button>
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Create Your First Game
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Calculate countdown
  const now = new Date();
  const diff = nextGame.scheduledAt.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let countdown: string | null = null;
  if (days > 0) {
    countdown = `${days} ${days === 1 ? "day" : "days"}`;
  } else if (hours > 0) {
    countdown = `${hours} ${hours === 1 ? "hour" : "hours"}`;
  } else {
    countdown = `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }

  const handleAddToCalendar = () => {
    const endTime = new Date(nextGame.scheduledAt.getTime() + nextGame.durationMinutes * 60 * 1000);

    // Format dates for calendar URL (YYYYMMDDTHHmmss)
    const formatDate = (date: Date) => {
      return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
    };

    const startDate = formatDate(nextGame.scheduledAt);
    const endDate = formatDate(endTime);

    // Create Google Calendar URL
    const calendarUrl = new URL("https://calendar.google.com/calendar/render");
    calendarUrl.searchParams.set("action", "TEMPLATE");
    calendarUrl.searchParams.set("text", nextGame.title);
    calendarUrl.searchParams.set("dates", `${startDate}/${endDate}`);
    calendarUrl.searchParams.set("details", `${nextGame.sport} game at ${nextGame.locationName}`);
    calendarUrl.searchParams.set("location", nextGame.locationName);

    window.open(calendarUrl.toString(), "_blank");
  };

  const handleGetDirections = () => {
    // Create Google Maps directions URL using coordinates
    const mapsUrl = new URL("https://www.google.com/maps/dir/");
    mapsUrl.searchParams.set("api", "1");
    mapsUrl.searchParams.set("destination", `${nextGame.location.lat},${nextGame.location.lon}`);

    window.open(mapsUrl.toString(), "_blank");
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Next game</CardTitle>
        </CardHeader>

        <CardContent className="px-6 space-y-4">
          {/* Main event details with countdown */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{nextGame.title}</h2>
                <span className="text-xs px-2 py-1 bg-muted rounded">{nextGame.sport}</span>
                {nextGame.isHost && (
                  <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded font-medium">Host</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {nextGame.scheduledAt.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{nextGame.locationName}</span>
                  {nextGame.distance && <span className="text-xs">({nextGame.distance} km)</span>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{countdown}</div>
              <p className="text-xs text-muted-foreground">until start</p>
            </div>
          </div>

          {/* Player bar and Quick Actions side by side */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Players Section */}
            <div className="space-y-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <UsersIcon className="h-3.5 w-3.5" />
                    Players
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setShowPlayersDialog(true)}
                    >
                      View Players
                    </Button>
                    <div className="flex items-center gap-1">
                      <UsersIcon className="h-4 w-4" />
                      <span className="text-sm font-semibold">
                        {nextGame.spotsFilled}/{nextGame.spotsTotal}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(nextGame.spotsFilled / nextGame.spotsTotal) * 100}%` }}
                  />
                </div>
                <div className="pt-1">
                  <span className="text-xs text-muted-foreground">Host: </span>
                  <span className="text-xs font-medium">{nextGame.hostName}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Quick Actions</span>
              </div>
              <div className="space-y-1.5">
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={handleGetDirections}>
                  <NavigationIcon className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" onClick={handleAddToCalendar}>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
                {nextGame.isHost ? (
                  <Link to="/games/$gameId/manage" params={{ gameId: nextGame.id }}>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full justify-start border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    size="sm"
                    disabled={leaveMutation.isPending && leaveMutation.variables === nextGame.id}
                    onClick={() => leaveMutation.mutate(nextGame.id)}
                  >
                    <UserMinusIcon className="h-4 w-4 mr-2" />
                    {leaveMutation.isPending && leaveMutation.variables === nextGame.id ? "Leaving..." : "Leave Game"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <ViewPlayersDialog
        gameId={nextGame.id}
        gameTitle={nextGame.title}
        open={showPlayersDialog}
        onOpenChange={setShowPlayersDialog}
      />
    </>
  );
}
