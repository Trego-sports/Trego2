import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { gameQueries } from "@/modules/games/queries";
import { GameListItem } from "./game-list-item";

export function RecommendedGamesCard() {
  const { data: recommendedGames } = useSuspenseQuery(gameQueries.getRecommendedGames());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
        <CardDescription>Games nearby that match your interests</CardDescription>
      </CardHeader>
      <CardContent>
        {recommendedGames.length > 0 ? (
          <div className="space-y-4">
            {recommendedGames.map((game) => (
              <GameListItem key={game.id} game={game} isParticipating={false} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No recommended games. Stay tuned for more recommendations!</p>
        )}
      </CardContent>
    </Card>
  );
}
