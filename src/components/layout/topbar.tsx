import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeftIcon, LogOutIcon, PlusCircleIcon, UserIcon } from "lucide-react";
import type { ReactNode } from "react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { $clearSession } from "@/lib/session";
import tregoLogo from "@/static/trego-logo-mark.svg";

export function TopBar() {
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const context = getHeaderContext(pathname);

  const handleLogout = async () => {
    await $clearSession();
    router.navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#c3c6d7] bg-[#f8f9ff]/95 shadow-[0_2px_10px_rgba(15,23,42,0.04)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/dashboard"
            aria-label="Back to dashboard"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-[#0b1c30] transition hover:bg-[#e5eeff] active:scale-[0.96]"
          >
            <ArrowLeftIcon className="size-5" />
          </Link>
          <Link to="/dashboard" className="hidden items-center gap-3 transition-opacity hover:opacity-80 sm:flex">
            <img src={tregoLogo} alt="Trego Logo" className="h-8 w-auto object-contain" />
            <span className="text-2xl font-black tracking-tight text-[#004ac6] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
              Trego
            </span>
          </Link>
          <div className="min-w-0 border-l border-[#d8def0] pl-3 sm:ml-1">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#004ac6]">{context.eyebrow}</p>
            <h1 className="truncate text-base font-black leading-5 text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif] md:text-lg">
              {context.title}
            </h1>
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <HeaderLink to="/dashboard" label="Home" active={pathname === "/dashboard"} />
          <HeaderLink
            to="/games/create"
            label="Create"
            active={pathname === "/games/create"}
            icon={<PlusCircleIcon />}
          />
          <HeaderLink to="/profile" label="Profile" active={pathname === "/profile"} icon={<UserIcon />} />
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell />
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            className="inline-flex size-10 items-center justify-center gap-2 rounded-lg text-sm font-bold text-[#38485d] transition hover:bg-[#e5eeff] hover:text-[#004ac6] active:scale-[0.96] sm:w-auto sm:px-3"
          >
            <LogOutIcon className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function HeaderLink({
  to,
  label,
  active,
  icon,
}: {
  to: "/dashboard" | "/games/create" | "/profile";
  label: string;
  active: boolean;
  icon?: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold transition active:scale-[0.96] ${
        active ? "bg-[#dae2fd] text-[#00174b]" : "text-[#38485d] hover:bg-[#e5eeff] hover:text-[#004ac6]"
      }`}
    >
      {icon && <span className="[&_svg]:size-4">{icon}</span>}
      {label}
    </Link>
  );
}

function getHeaderContext(pathname: string) {
  if (pathname === "/games/create") {
    return { eyebrow: "Host setup", title: "Create Game" };
  }

  if (pathname.includes("/manage")) {
    return { eyebrow: "Host tools", title: "Manage Game" };
  }

  if (pathname.includes("/attendance")) {
    return { eyebrow: "Host tools", title: "Attendance" };
  }

  if (pathname === "/profile") {
    return { eyebrow: "Player profile", title: "Profile" };
  }

  if (pathname.includes("/users/")) {
    return { eyebrow: "Player profile", title: "Player" };
  }

  return { eyebrow: "Trego", title: "Game hub" };
}
