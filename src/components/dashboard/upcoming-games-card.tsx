import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { gameQueries } from "@/modules/games/queries";
import { GameListItem } from "./game-list-item";

export function UpcomingGamesCard() {
  const { data: upcomingGames } = useSuspenseQuery(gameQueries.getUpcomingGames());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Games</CardTitle>
        <CardDescription>Games you're participating in or hosting</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingGames.length > 0 ? (
          <div className="space-y-4">
            {upcomingGames.map((game) => (
              <GameListItem key={game.id} game={game} isParticipating={true} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No upcoming games. Join a game to get started!</p>
        )}
      </CardContent>
    </Card>
  );
}
