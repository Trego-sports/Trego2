import { useSuspenseQuery } from "@tanstack/react-query";
import { HistoryIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gameQueries } from "@/modules/games/queries";

export function YourPastGamesCard() {
  const { data: pastGamesBySport } = useSuspenseQuery(gameQueries.getPastGamesBySport());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HistoryIcon className="h-4 w-4" />
          Your Past Games
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pastGamesBySport.length > 0 ? (
            pastGamesBySport.map((item) => (
              <div key={item.sport} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm font-medium">{item.sport}</span>
                <span className="text-sm text-muted-foreground">
                  {item.count} {item.count === 1 ? "game" : "games"}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-2">No past games yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
