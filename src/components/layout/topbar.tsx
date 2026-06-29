import { Link, useMatchRoute, useRouter } from "@tanstack/react-router";
import { HomeIcon, LogOutIcon, PlusCircleIcon, UserIcon } from "lucide-react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { $clearSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import tregoLogo from "@/static/trego1.avif";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: HomeIcon },
  { label: "Create", to: "/games/create", icon: PlusCircleIcon },
  { label: "Profile", to: "/profile", icon: UserIcon },
] as const;

export function TopBar() {
  const router = useRouter();
  const matchRoute = useMatchRoute();

  const handleLogout = async () => {
    await $clearSession();
    router.navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/92 px-4 shadow-[0_10px_32px_rgba(0,0,0,0.04)] backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4">
        <Link
          to="/dashboard"
          reloadDocument
          className="group flex min-h-11 items-center gap-3 transition-[opacity,transform] duration-200 hover:opacity-85 active:scale-[0.96]"
        >
          <img src={tregoLogo} alt="Trego Logo" className="h-9 w-9 rounded-full bg-card object-contain" />
          <span>
            <span className="block text-lg font-bold leading-none">Trego</span>
            <span className="hidden text-xs font-semibold text-muted-foreground sm:block">Pickup sports hub</span>
          </span>
        </Link>

        <nav
          aria-label="App navigation"
          className="hidden items-center gap-1 bg-muted/55 p-1 shadow-[inset_0_0_0_1px_var(--border)] md:flex"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = Boolean(matchRoute({ to: item.to, fuzzy: item.to !== "/dashboard" }));

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 px-4 text-sm font-semibold text-muted-foreground transition-[background-color,color,transform] duration-200 hover:bg-background hover:text-foreground active:scale-[0.96]",
                  isActive && "bg-background text-foreground shadow-[0_6px_16px_rgba(0,0,0,0.06)]",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 md:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = Boolean(matchRoute({ to: item.to, fuzzy: item.to !== "/dashboard" }));

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-label={item.label}
                  className={cn(
                    "inline-flex min-h-10 min-w-10 items-center justify-center text-muted-foreground transition-[background-color,color,transform] duration-200 hover:bg-accent hover:text-accent-foreground active:scale-[0.96]",
                    isActive && "bg-accent text-accent-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </Link>
              );
            })}
          </div>
          <NotificationBell />
          <Link
            to="/games/create"
            className="hidden min-h-10 items-center gap-2 bg-primary px-4 text-sm font-semibold text-primary-foreground transition-[background-color,transform] duration-200 hover:bg-primary/90 active:scale-[0.96] lg:inline-flex"
          >
            <PlusCircleIcon className="size-4" />
            New game
          </Link>
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={handleLogout}
            aria-label="Logout"
            className="transition-[background-color,color,transform] duration-200 active:scale-[0.96]"
          >
            <LogOutIcon className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
