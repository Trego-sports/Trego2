import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, ErrorComponent, Link } from "@tanstack/react-router";
import { PlusCircleIcon, UserIcon } from "lucide-react";
import { CompleteSetupAlert } from "@/components/complete-setup-alert";
import { MyFriendsCard } from "@/components/dashboard/my-friends-card";
import { NextGameCard } from "@/components/dashboard/next-game-card";
import { RecommendedGamesCard } from "@/components/dashboard/recommended-games-card";
import { UpcomingGamesCard } from "@/components/dashboard/upcoming-games-card";
import { YourPastGamesCard } from "@/components/dashboard/your-sports-card";
import { Button } from "@/components/ui/button";
import { gameQueries } from "@/modules/games/queries";
import { userQueries } from "@/modules/profile/queries";

export const Route = createFileRoute("/_authed/dashboard")({
  component: DashboardPage,
  errorComponent: ErrorComponent,
  loader: async ({ context }) => {
    // Kick off data fetching immediately.
    context.queryClient.ensureQueryData(userQueries.isSetupCompleted());
    context.queryClient.ensureQueryData(userQueries.getMyFriends());
    context.queryClient.ensureQueryData(gameQueries.getUpcomingGames());
    context.queryClient.ensureQueryData(gameQueries.getRecommendedGames());
    context.queryClient.ensureQueryData(gameQueries.getPastGamesBySport());
  },
});

function DashboardPage() {
  const { data: isSetupCompleted } = useSuspenseQuery(userQueries.isSetupCompleted());

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your games and activities</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/profile">
            <Button variant="outline" size="lg">
              <UserIcon />
              My Profile
            </Button>
          </Link>
          <Link to="/games/create">
            <Button size="lg">
              <PlusCircleIcon />
              Create Game
            </Button>
          </Link>
        </div>
      </div>

      {!isSetupCompleted && <CompleteSetupAlert />}

      {/* Next Game Overview */}
      <NextGameCard />

      {/* Main Content Area - Two Column Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Game Lists */}
        <div className="lg:col-span-2 space-y-8">
          <UpcomingGamesCard />
          <RecommendedGamesCard />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <YourPastGamesCard />
          <MyFriendsCard />
        </div>
      </div>
    </div>
  );
}
