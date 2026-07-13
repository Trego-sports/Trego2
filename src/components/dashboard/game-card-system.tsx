import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  LockIcon,
  MapPinIcon,
  TrophyIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type GameStatus = "available" | "joined" | "full";

export type GameCardGame = {
  sport: string;
  title: string;
  scheduledAt: Date;
  locationName: string;
  hostName?: string;
  isHost?: boolean;
  spotsFilled?: number;
  spotsTotal?: number;
  skillLevels?: string[];
  distance?: number;
};

export function getGameStatus(
  game: Pick<GameCardGame, "spotsFilled" | "spotsTotal">,
  isParticipating = false,
): GameStatus {
  if (isParticipating) return "joined";
  if (hasCapacity(game) && game.spotsFilled >= game.spotsTotal) return "full";
  return "available";
}

export function GameStatusBadge({ status, className }: { status: GameStatus; className?: string }) {
  const Icon = status === "joined" ? CheckCircleIcon : status === "full" ? LockIcon : null;
  const label = status === "joined" ? "Joined" : status === "full" ? "Full" : "Available";

  return (
    <span
      className={cn(
        "inline-flex max-w-full shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase leading-none tracking-[0.05em]",
        status === "joined" && "bg-[#166534] text-white",
        status === "full" && "bg-[#ba1a1a] text-white",
        status === "available" && "bg-[#e6e8ea] text-[#434656]",
        className,
      )}
    >
      {Icon ? <Icon className="size-3.5 shrink-0" /> : null}
      <span className="truncate">{label}</span>
    </span>
  );
}

export function GameActionButton({
  children,
  icon: Icon,
  variant = "secondary",
  disabled,
  onClick,
  className,
}: {
  children: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  variant?: "primary" | "secondary" | "danger" | "utility";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-60",
        variant === "primary" && "bg-[#004ac6] text-white hover:bg-[#0038a8]",
        variant === "secondary" && "border border-[#737688] bg-white text-[#0b1c30] hover:bg-[#eff4ff]",
        variant === "danger" && "bg-[#ffdad6] text-[#93000a] hover:bg-[#ffc8c1]",
        variant === "utility" && "border border-[#c3c5d9] bg-white text-[#004ac6] hover:bg-[#eff4ff]",
        className,
      )}
    >
      {Icon ? <Icon className="size-4 shrink-0" /> : null}
      <span className="truncate">{children}</span>
    </button>
  );
}

export function GameFeaturedCard({
  game,
  status,
  countdown,
  actions,
  onViewPlayers,
  calendarNote,
  className,
}: {
  game: GameCardGame;
  status: GameStatus;
  countdown?: string;
  actions?: ReactNode;
  onViewPlayers?: () => void;
  calendarNote?: string | null;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-xl border border-[#c3c5d9] bg-white p-5 shadow-sm md:rounded-lg md:p-6",
        "transition hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute right-0 bottom-0 hidden size-32 translate-x-10 translate-y-10 rounded-full border-[20px] border-[#d3e4fe] md:block" />
      <div className="relative flex flex-col gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <SportMark sport={game.sport} />
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <GameStatusBadge status={status} />
                {countdown ? (
                  <span className="rounded-full bg-[#d3e4fe] px-2.5 py-1 text-xs font-semibold text-[#0038b6]">
                    {countdown}
                  </span>
                ) : null}
                <span className="min-w-0 truncate text-sm font-medium text-[#434656]">{game.sport} Match</span>
              </div>
              <h3 className="line-clamp-2 text-2xl font-bold leading-8 text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif] md:text-[28px]">
                {game.title}
              </h3>
            </div>
          </div>

          <div className="min-w-0 md:max-w-72 md:text-right">
            <p className="truncate text-lg font-bold text-[#0b1c30] md:text-xl">
              {formatPrimaryDate(game.scheduledAt)}
            </p>
            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-[#434656] md:justify-end">
              <MapPinIcon className="size-4 shrink-0 text-[#004ac6]" />
              <span className="truncate">{game.locationName}</span>
            </p>
          </div>
        </div>

        <div className="border-t border-[#c3c5d9]" />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0 space-y-3">
            <GameMetadata game={game} />
            <GameCapacity game={game} onViewPlayers={onViewPlayers} />
            {calendarNote ? <p className="text-xs font-medium text-[#434656]">{calendarNote}</p> : null}
          </div>

          {actions ? <div className="flex min-h-10 flex-wrap gap-2 lg:justify-end">{actions}</div> : null}
        </div>
      </div>
    </article>
  );
}

export function GameStandardCard({
  game,
  status,
  actions,
  featuredImage,
  className,
}: {
  game: GameCardGame;
  status: GameStatus;
  actions?: ReactNode;
  featuredImage?: string;
  className?: string;
}) {
  const spotsRemaining = hasCapacity(game) ? Math.max(game.spotsTotal - game.spotsFilled, 0) : null;

  return (
    <article
      className={cn(
        "flex min-h-full flex-col overflow-hidden rounded-xl border border-[#c3c5d9] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] md:rounded-lg",
        className,
      )}
    >
      {featuredImage ? (
        <div className="relative aspect-[16/8.5] overflow-hidden bg-[#e6e8ea]">
          <img src={featuredImage} alt="" className="size-full object-cover" />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <GameStatusBadge status={status} />
          <span className="flex min-w-0 items-center gap-1 rounded-md bg-[#d3e4fe] px-2.5 py-1 text-xs font-bold text-[#0038b6]">
            <TrophyIcon className="size-3.5 shrink-0" />
            <span className="truncate">{game.sport}</span>
          </span>
        </div>

        <h3 className="line-clamp-2 text-xl font-bold leading-7 text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
          {game.title}
        </h3>
        <p className="mt-2 flex min-w-0 items-center gap-1.5 text-sm text-[#434656]">
          <MapPinIcon className="size-4 shrink-0 text-[#004ac6]" />
          <span className="truncate">{game.locationName}</span>
          {game.distance ? <span className="shrink-0">• {kmToMiles(game.distance)} mi</span> : null}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#e0e3e5] pt-4 text-sm">
          <MetaBlock label="Time" value={formatShortDateTime(game.scheduledAt)} icon={CalendarIcon} />
          <MetaBlock label="Host" value={game.hostName ?? "Trego host"} icon={UserIcon} />
        </div>

        <div className="mt-4">
          <GameCapacity game={game} compact />
          {spotsRemaining !== null && status !== "full" ? (
            <p className="mt-2 text-xs font-semibold text-[#ba1a1a]">{spotsRemaining} spots left</p>
          ) : null}
        </div>

        {actions ? <div className="mt-auto flex min-h-10 gap-2 pt-4">{actions}</div> : null}
      </div>
    </article>
  );
}

export function GameCompactListItem({
  game,
  status,
  action,
  onViewPlayers,
  className,
}: {
  game: GameCardGame;
  status: GameStatus;
  action?: ReactNode;
  onViewPlayers?: () => void;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-lg border border-[#e6e8ea] bg-white p-3 transition hover:border-[#c3c5d9] hover:bg-[#f8f9ff]",
        className,
      )}
    >
      <SportMark sport={game.sport} compact />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-bold text-[#0b1c30]">{game.title}</h3>
          <GameStatusBadge status={status} className="hidden sm:inline-flex" />
        </div>
        <p className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#434656]">
          <span className="inline-flex min-w-0 items-center gap-1">
            <ClockIcon className="size-3 shrink-0" />
            <span className="truncate">{formatShortDateTime(game.scheduledAt)}</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPinIcon className="size-3 shrink-0" />
            <span className="max-w-36 truncate">{game.locationName}</span>
          </span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden">
          <GameStatusBadge status={status} />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {hasCapacity(game) ? (
          <button
            type="button"
            onClick={onViewPlayers}
            className="hidden min-w-12 text-right text-xs font-bold text-[#0b1c30] sm:block"
          >
            {game.spotsFilled}/{game.spotsTotal}
          </button>
        ) : null}
        {action}
      </div>
    </article>
  );
}

function SportMark({ sport, compact = false }: { sport: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-[#d3e4fe] text-[#004ac6]",
        compact ? "size-10 rounded-full" : "size-14",
      )}
      title={sport}
    >
      <TrophyIcon className={compact ? "size-5" : "size-7"} aria-hidden="true" />
    </div>
  );
}

function GameMetadata({ game }: { game: GameCardGame }) {
  return (
    <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-2 text-sm text-[#434656]">
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <ClockIcon className="size-4 shrink-0 text-[#004ac6]" />
        <span className="truncate">{formatShortDateTime(game.scheduledAt)}</span>
      </span>
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <UserIcon className="size-4 shrink-0 text-[#004ac6]" />
        <span className="truncate">Host: {game.hostName ?? "Trego host"}</span>
      </span>
      {game.skillLevels?.length ? (
        <span className="truncate rounded-full bg-[#eff4ff] px-2 py-0.5 text-xs font-semibold text-[#434656]">
          {game.skillLevels.join(", ")}
        </span>
      ) : null}
    </div>
  );
}

function GameCapacity({
  game,
  compact = false,
  onViewPlayers,
}: {
  game: GameCardGame;
  compact?: boolean;
  onViewPlayers?: () => void;
}) {
  if (!hasCapacity(game)) return null;

  const percent = Math.min((game.spotsFilled / game.spotsTotal) * 100, 100);
  const label = `${game.spotsFilled}/${game.spotsTotal} Players`;

  return (
    <div className={cn("min-w-0", compact ? "space-y-2" : "max-w-md space-y-2")}>
      <div className="flex items-center justify-between gap-3 text-xs text-[#434656]">
        <button
          type="button"
          onClick={onViewPlayers}
          className={cn(
            "inline-flex items-center gap-1.5 font-semibold text-[#0b1c30]",
            !onViewPlayers && "pointer-events-none",
          )}
        >
          <UsersIcon className="size-3.5" />
          {label}
        </button>
        <span className="shrink-0">{game.spotsTotal - game.spotsFilled} open</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#d3e4fe]">
        <div className="h-full rounded-full bg-[#004ac6]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function MetaBlock({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.05em] text-[#737688]">
        <Icon className="size-3" />
        {label}
      </p>
      <p className="truncate text-sm font-semibold text-[#0b1c30]">{value}</p>
    </div>
  );
}

function hasCapacity(game: Pick<GameCardGame, "spotsFilled" | "spotsTotal">): game is GameCardGame & {
  spotsFilled: number;
  spotsTotal: number;
} {
  return typeof game.spotsFilled === "number" && typeof game.spotsTotal === "number" && game.spotsTotal > 0;
}

function formatPrimaryDate(date: Date) {
  const isToday = date.toDateString() === new Date().toDateString();
  return `${isToday ? "Today" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${date.toLocaleTimeString(
    [],
    {
      hour: "numeric",
      minute: "2-digit",
    },
  )}`;
}

function formatShortDateTime(date: Date) {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function kmToMiles(km: number) {
  return (km * 0.621371).toFixed(1);
}
