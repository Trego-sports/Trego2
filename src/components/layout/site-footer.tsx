import { Link } from "@tanstack/react-router";
import { CalendarDaysIcon, MapPinIcon, ShieldCheckIcon } from "lucide-react";
import tregoLogo from "@/static/trego1.avif";

const appLinks = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Create game", to: "/games/create" },
  { label: "Profile", to: "/profile" },
] as const;

export function MarketingFooter() {
  return (
    <footer className="marketing-footer border-t border-[#CFC6B7] bg-[#F7F0E5] px-6 py-14 text-[#242822] sm:px-8 sm:py-16 lg:px-10">
      <div className="mx-auto flex max-w-[1580px] flex-col gap-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <img
              src={tregoLogo}
              alt="Trego"
              className="h-12 w-12 object-contain outline outline-1 -outline-offset-1 outline-black/10"
            />
            <div>
              <p className="text-3xl font-black leading-none tracking-[-0.02em] text-[#242822]">Trego</p>
              <p className="mt-2 text-lg font-semibold leading-6 text-[#6E6A5F]">
                Organize sports games with your friends
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:items-end">
            <nav aria-label="Legal navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-black">
              <Link className="text-[#6E6A5F] transition-colors hover:text-[#242822]" to="/privacy">
                Privacy Policy
              </Link>
              <Link className="text-[#6E6A5F] transition-colors hover:text-[#242822]" to="/terms">
                Terms of Service
              </Link>
            </nav>
            <p className="text-base font-semibold leading-6 text-[#6E6A5F] sm:text-lg">
              © 2025 Trego. All rights reserved.
            </p>
          </div>
        </div>

        <p className="border-t border-[#CFC6B7] pt-6 text-sm font-semibold leading-7 text-[#6E6A5F] sm:max-w-4xl">
          Trego lets you create and join sports games, manage players, and optionally sync games to your Google Calendar
          with reminders. See our{" "}
          <Link
            className="font-black text-[#E8791F] underline decoration-[#E8791F]/35 underline-offset-4"
            to="/privacy"
          >
            Privacy Policy
          </Link>{" "}
          for how we handle your data.
        </p>
      </div>
    </footer>
  );
}

export function AppFooter() {
  return (
    <footer className="border-t bg-background/95 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-3">
          <img src={tregoLogo} alt="Trego" className="h-10 w-10 rounded-full bg-card object-contain" />
          <div>
            <p className="text-base font-bold leading-none">Trego</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground text-pretty">
              Find games, manage rosters, and keep pickup sports organized.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <nav aria-label="App footer navigation" className="flex flex-wrap gap-2 text-sm font-semibold">
            {appLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="inline-flex min-h-10 items-center px-3 text-muted-foreground transition-[background-color,color,transform] duration-200 hover:bg-accent hover:text-accent-foreground active:scale-[0.96]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="size-3.5" />
              Waterloo
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDaysIcon className="size-3.5" />
              Game day ready
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheckIcon className="size-3.5" />
              Host controlled
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
