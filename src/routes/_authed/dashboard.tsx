import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, ErrorComponent, Link } from "@tanstack/react-router";
import { DumbbellIcon, HomeIcon, PlusCircleIcon, SearchIcon, UserIcon, UserPlusIcon, ZapIcon } from "lucide-react";
import { CalendarConnectPromptDialog } from "@/components/calendar/calendar-connect-prompt-dialog";
import { CompleteSetupAlert } from "@/components/complete-setup-alert";
import { MyFriendsCard } from "@/components/dashboard/my-friends-card";
import { NextGameCard } from "@/components/dashboard/next-game-card";
import { RecommendedGamesCard } from "@/components/dashboard/recommended-games-card";
import { UpcomingGamesCard } from "@/components/dashboard/upcoming-games-card";
import { YourPastGamesCard, YourSportsCard } from "@/components/dashboard/your-sports-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { calendarQueries } from "@/modules/calendar/queries";
import { gameQueries } from "@/modules/games/queries";
import { userQueries } from "@/modules/profile/queries";
import tregoLogo from "@/static/trego-logo-mark.svg";

export const Route = createFileRoute("/_authed/dashboard")({
  component: DashboardPage,
  errorComponent: ErrorComponent,
  loader: async ({ context }) => {
    // Kick off data fetching immediately.
    context.queryClient.ensureQueryData(userQueries.isSetupCompleted());
    context.queryClient.ensureQueryData(userQueries.getMyProfile());
    context.queryClient.ensureQueryData(userQueries.getMyFriends());
    context.queryClient.ensureQueryData(gameQueries.getUpcomingGames());
    context.queryClient.ensureQueryData(gameQueries.getRecommendedGames());
    context.queryClient.ensureQueryData(gameQueries.getPastGames());
    context.queryClient.ensureQueryData(calendarQueries.getStatus());
  },
});

function DashboardPage() {
  const { data: isSetupCompleted } = useSuspenseQuery(userQueries.isSetupCompleted());
  const { data: profile } = useSuspenseQuery(userQueries.getMyProfile());
  const firstName = profile.name.split(" ")[0] || profile.name || "there";
  const profilePercent = getProfileCompletion(profile, isSetupCompleted);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div className="min-h-screen bg-[#eff4ff] text-[#0b1c30] [font-family:Inter,ui-sans-serif,system-ui,sans-serif]">
        <DesktopSidebar name={profile.name} profilePictureUrl={profile.profilePictureUrl} />
        <MobileTopBar />

        <main className="min-h-screen px-4 pt-20 pb-28 md:ml-64 md:px-8 md:pt-8 md:pb-10">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:gap-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="hidden text-5xl font-black leading-[1.05] tracking-tight text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif] md:block">
                  Ready to Play, {firstName}?
                </h1>
                <h1 className="text-[28px] font-bold leading-9 text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif] md:hidden">
                  Hello, <span className="text-[#004ac6]">{firstName}</span>
                </h1>
                <div className="mt-4 hidden items-center gap-3 md:flex">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-[#c3c6d7]">
                    <div className="h-full rounded-full bg-[#004ac6]" style={{ width: `${profilePercent}%` }} />
                  </div>
                  <span className="text-sm text-[#434655]">Profile {profilePercent}% Complete</span>
                </div>
              </div>

              <Link
                to="/games/create"
                className="hidden h-14 items-center justify-center gap-3 rounded-lg bg-[#004ac6] px-8 text-lg font-semibold text-white shadow-sm transition hover:bg-[#003ea8] md:inline-flex"
              >
                <PlusCircleIcon className="size-6" />
                Create Game
              </Link>
            </header>

            <section className="grid grid-cols-2 gap-3 md:hidden">
              <Link
                to="/games/create"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#004ac6] text-sm font-semibold tracking-[0.05em] text-white shadow-sm"
              >
                <PlusCircleIcon className="size-4" />
                Create Game
              </Link>
              <Link
                to="/profile"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#ca3700] text-sm font-semibold tracking-[0.05em] text-white shadow-sm"
              >
                <ZapIcon className="size-4" />
                Quick Join
              </Link>
            </section>

            {!isSetupCompleted && <CompleteSetupAlert />}
            <CalendarConnectPromptDialog />

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="flex min-w-0 flex-col gap-8">
                <NextGameCard />
                <RecommendedGamesCard />
                <div className="grid gap-8 lg:grid-cols-2">
                  <UpcomingGamesCard />
                  <YourPastGamesCard />
                </div>
                <div className="grid gap-8 xl:hidden">
                  <YourSportsCard />
                  <MyFriendsCard />
                </div>
              </div>

              <aside className="hidden flex-col gap-6 xl:flex">
                <QuickActionsCard />
                <YourSportsCard />
                <MyFriendsCard />
              </aside>
            </div>
          </div>
        </main>

        <SiteFooter className="pb-24 md:ml-64 md:pb-6" />
        <MobileBottomNav />
      </div>
    </>
  );
}

function DesktopSidebar({ name, profilePictureUrl }: { name: string; profilePictureUrl: string | null }) {
  const navItems = [
    { label: "Home", icon: HomeIcon, to: "/dashboard" as const, active: true },
    { label: "Discover", icon: SearchIcon, to: "/dashboard" as const },
    { label: "Create", icon: PlusCircleIcon, to: "/games/create" as const },
    { label: "My Games", icon: DumbbellIcon, to: "/dashboard" as const },
    { label: "Profile", icon: UserIcon, to: "/profile" as const },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#c3c6d7] bg-[#f8f9ff] shadow-[0_2px_4px_rgba(15,23,42,0.05)] md:flex">
      <Link to="/dashboard" className="flex items-center gap-3 px-8 py-6 transition-opacity hover:opacity-80">
        <img src={tregoLogo} alt="Trego Logo" className="h-8 w-auto object-contain" />
        <span className="text-2xl font-black tracking-tight text-[#004ac6] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
          Trego
        </span>
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-semibold tracking-[0.05em] transition ${
                item.active ? "bg-[#2563eb] text-white" : "text-[#434655] hover:bg-[#e5eeff] hover:text-[#004ac6]"
              }`}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#c3c6d7] p-4">
        <div className="flex items-center gap-3">
          <Avatar name={name} profilePictureUrl={profilePictureUrl} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-[0.05em] text-[#0b1c30]">{name}</p>
            <p className="text-xs text-[#434655]">Player profile</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileTopBar() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b border-[#e5eeff] bg-[#f8f9ff] px-4 shadow-sm md:hidden">
      <Link to="/dashboard" className="flex size-8 items-center justify-center">
        <img src={tregoLogo} alt="Trego Logo" className="size-8 object-contain" />
      </Link>
      <Link
        to="/dashboard"
        className="text-xl font-black tracking-tight text-[#004ac6] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]"
      >
        Trego
      </Link>
      <NotificationBell />
    </header>
  );
}

function MobileBottomNav() {
  const items = [
    { label: "Home", icon: HomeIcon, to: "/dashboard" as const, active: true },
    { label: "Discover", icon: SearchIcon, to: "/dashboard" as const },
    { label: "Create", icon: PlusCircleIcon, to: "/games/create" as const },
    { label: "My Games", icon: DumbbellIcon, to: "/dashboard" as const },
    { label: "Profile", icon: UserIcon, to: "/profile" as const },
  ];

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 flex items-center justify-around rounded-t-xl border-t border-[#c3c6d7] bg-white px-3 py-2 shadow-[0_-2px_10px_rgba(15,23,42,0.05)] md:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            to={item.to}
            className={`flex min-w-12 flex-col items-center justify-center rounded-lg px-2 py-1 text-[10px] font-medium transition ${
              item.active ? "bg-[#dae2fd] text-[#00174b]" : "text-[#0b1c30] hover:text-[#004ac6]"
            }`}
          >
            <Icon className="mb-0.5 size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function QuickActionsCard() {
  const actions = [
    { label: "Host Game", icon: PlusCircleIcon, to: "/games/create" as const },
    { label: "Invite Friend", icon: UserPlusIcon, to: "/profile" as const },
    { label: "Discover", icon: SearchIcon, to: "/dashboard" as const },
    { label: "Preferences", icon: UserIcon, to: "/profile" as const },
  ];

  return (
    <section className="rounded-lg border border-[#c3c6d7] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-2xl font-semibold leading-8 text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.to}
              className="flex min-h-20 flex-col items-center justify-center rounded-lg border border-[#c3c6d7] bg-[#eff4ff] p-3 text-center transition hover:bg-[#e5eeff]"
            >
              <Icon className="mb-2 size-5 text-[#004ac6]" />
              <span className="text-xs font-bold text-[#0b1c30]">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Avatar({ name, profilePictureUrl }: { name: string; profilePictureUrl: string | null }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#dce9ff] text-sm font-bold text-[#004ac6]">
      {profilePictureUrl ? <img src={profilePictureUrl} alt={name} className="size-full object-cover" /> : name[0]}
    </div>
  );
}

function getProfileCompletion(
  profile: {
    name: string;
    location: unknown;
    playerSports: unknown[];
    calendarIntegration: { connectedAt: Date | null } | null;
  },
  isSetupCompleted: boolean,
) {
  let score = 30;
  if (profile.name) score += 20;
  if (isSetupCompleted || profile.playerSports.length > 0) score += 30;
  if (profile.location) score += 10;
  if (profile.calendarIntegration?.connectedAt) score += 10;
  return Math.min(score, 100);
}
