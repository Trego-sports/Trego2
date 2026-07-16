import { createFileRoute, ErrorComponent, Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  BarChart3Icon,
  CheckCircle2Icon,
  ClockIcon,
  DumbbellIcon,
  MailIcon,
  MapPinIcon,
  MegaphoneIcon,
  MenuIcon,
  Repeat2Icon,
  ShieldCheckIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { $getPlatformStats } from "@/modules/home/get-platform-stats";
import tregoLogo from "@/static/trego-logo-mark.svg";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      return await $getPlatformStats();
    } catch {
      return { playerCount: 0, gameCount: 0 };
    }
  },
  component: HomePage,
  errorComponent: ErrorComponent,
});

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const navItems = ["Browse Games", "Competitions", "Venues", "Community"];

const mobileHeroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDhfbaZXKO9tM7IYHZ__dlat39EmWUcj3dAvoHMv4Umtb13MAGJh-D6Dys4YvDTbgKZebxP1Jvuqe_h58X5mRwJ7gxdyQQbJlMOJVmDjiO2sk3WcpvQqiGcI9IvfmA1Yu8XwRBI6bMbS4ppQP3geMb8bCjON2VfvKczQeMpsXOCqWPM2t6T7leIkpiMx1oiaLHN1nvcxacaWpl3rkvyMJKmNWa2wHaiw_f8gctJcT696NRx7Mn4nCpFlcxaB6kcGDAy2BzM2JCMvuM";

const liveGames = [
  {
    title: "Basketball Evening Run",
    location: "Rucker Park",
    time: "6:00 PM",
    host: "Mike",
    initial: "M",
    level: "Intermediate",
    levelClass: "bg-[#dae2fd] text-[#131b2e]",
    spots: "8 / 10",
    progress: "80%",
    actionClass: "bg-[#ca3700] text-white hover:bg-[#9f2a00]",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuByujA0scAjyCDc0L0kicF-KmqjHaesLRYBi0iY_aAWQbnOGPS4AqBCQdGRGQn1h4rNTxqYGmyfyW0lVtSTj1cyCZlN70bAAwHT9jWOmGOvkfyzzQ2NwSX1AxY7fyZ_a0-j_VcaTlcHNExMpT7RJ0fxwOwBScUPZAB5IwxntfDtDS08zSIzlDVQM2XLLoRQfEWpHAmAOcQn5NUIcKLwsR8lAzSrbJc00hx58lBISWtIMSYVyhK5agKW3EtzgMIb5nW7MykJVaNMYVM",
  },
  {
    title: "Football 7s",
    location: "Central Field",
    time: "7:30 PM",
    host: "Sarah",
    initial: "S",
    level: "Pro",
    levelClass: "bg-[#0b1c30] text-white",
    spots: "12 / 14",
    progress: "85%",
    actionClass: "bg-[#ca3700] text-white hover:bg-[#9f2a00]",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBu6L-cGcJU6W8PJ1I_S6a2JCAz_al11tESt8j13Cn4X8DZo8NKW5e8FGB1-rnHBmXjz2FlOWyux7X957X_robwY7JEQmJBqHts0EDb19WzYAH11HvxUML3RQIRqSDwSMMZFAGnJ1_uNJ01kUbheRveYq8fg5MJR47Fq3LV-pqsktgnc0DTim3HVI-80iHC6YksYaxK5N0t_PrrcM09sHq_cYOAhLznJpg-LmJU2aQcR3vSjnCTUO0tPf-VMkD_CwJoX8iPyRTpyV4",
  },
  {
    title: "Badminton Doubles",
    location: "West Court",
    time: "5:00 PM",
    host: "Alex",
    initial: "A",
    level: "Beginner",
    levelClass: "bg-[#dce9ff] text-[#0b1c30]",
    spots: "2 / 4",
    progress: "50%",
    actionClass: "bg-[#2563eb] text-white hover:bg-[#003ea8]",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCT1bhwpWUQAmCCp0pA9fZPsQE6inSi5uvwixgbxEypjZjuz4IKKZyC4C8UW3T70d6GBzJ5NIck0SjJv6ngHG7TlPvbRR4pw9iWEYKBENM78YCCmeEI9t3ZSN9Uxy7d5SXtkLtluXJLuSUgMMarh30Bx5jAHSG7XfRzKRbOJseC5TNe3XAX59fRLX7sZfCeCF_ZGTBmzC907Ydl-8YSJpdWLCdGoLIfCpQYnOY6P9hi9yLvLWjt4vwaZAYL2mREYqHBpOPdtgZXAVA",
  },
];

const organizerFeatures = [
  {
    icon: UsersIcon,
    title: "Capacity Management",
    description: "Set limits and let the waitlist handle the rest.",
  },
  {
    icon: MegaphoneIcon,
    title: "Instant Announcements",
    description: "Push weather updates or venue changes instantly to rosters.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Attendance Tracking",
    description: "Know who shows up and build reliable squads.",
  },
];

const steps = [
  {
    title: "Create Profile",
    description: "Set your skill level, preferred sports, and availability.",
  },
  {
    title: "Find or Host Games",
    description: "Browse open matches nearby or set up your own run.",
  },
  {
    title: "Play & Connect",
    description: "Show up, compete, and build your local athletic network.",
  },
];

const mobileTrendingSports = [
  {
    title: "Downtown Hoops",
    location: "City Park Court",
    capacity: "5/10",
    action: "Join",
    icon: TrophyIcon,
    isFull: false,
  },
  {
    title: "Sunday League",
    location: "Northside Turf",
    capacity: "12/22",
    action: "Join",
    icon: DumbbellIcon,
    isFull: false,
  },
  {
    title: "Casual Shuttles",
    location: "Rec Center A",
    capacity: "Full",
    action: "Full",
    icon: Repeat2Icon,
    isFull: true,
  },
];

const mobileHostBullets = ["Automated waitlists", "Integrated payments", "Player ratings"];

function HomePage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] [font-family:Inter,ui-sans-serif,system-ui,sans-serif]">
        <HomeNav />
        <MobileHome />
        <main className="mx-auto hidden w-full max-w-7xl flex-col gap-24 px-5 py-12 md:flex md:px-8 md:py-16">
          <HeroSection />
          <LiveGamesSection />
          <OrganizerSection />
          <StepsSection />
        </main>
        <SiteFooter className="mt-16" />
      </div>
    </>
  );
}

function HomeNav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#c3c6d7]/60 bg-[#f8f9ff]/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:h-16 md:px-8">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <img src={tregoLogo} alt="Trego Logo" className="size-8 rounded-full object-contain" />
          <span className="text-2xl font-bold tracking-tight text-[#004ac6] md:text-xl">Trego</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item}
              to="/login"
              className="rounded-md px-3 py-2 text-sm font-medium tracking-[0.05em] text-[#565e74] transition hover:bg-[#eff4ff] hover:text-[#004ac6]"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-md px-4 py-2 text-sm font-semibold tracking-[0.05em] text-[#004ac6] transition hover:bg-[#eff4ff]"
          >
            Login
          </Link>
          <Link
            to="/login"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2563eb] px-5 text-sm font-semibold tracking-[0.05em] text-white transition hover:bg-[#003ea8]"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          className="inline-flex size-10 items-center justify-center rounded-lg text-[#004ac6] transition hover:bg-[#eff4ff] md:hidden"
        >
          <MenuIcon className="size-6" />
        </button>
      </div>
    </nav>
  );
}

function MobileHome() {
  return (
    <main className="md:hidden">
      <MobileHeroSection />
      <MobileTrendingSection />
      <MobileHostSection />
    </main>
  );
}

function MobileHeroSection() {
  return (
    <section className="flex flex-col items-center px-4 py-8 text-center">
      <h1 className="mb-2 text-[28px] font-bold leading-9 text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
        Find Your Next Match
      </h1>
      <p className="mb-6 max-w-sm text-base leading-6 text-[#434655]">
        Join local pickup games, leagues, and tournaments. The court is waiting.
      </p>

      <div className="mb-8 flex w-full flex-col gap-2">
        <Link
          to="/login"
          className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#2563eb] text-sm font-semibold tracking-[0.05em] text-white shadow-[0_2px_4px_rgba(15,23,42,0.05)] transition active:scale-[0.99]"
        >
          Find Games Near Me
        </Link>
        <Link
          to="/login"
          className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-[#c3c6d7] bg-[#dce9ff] text-sm font-semibold tracking-[0.05em] text-[#004ac6] shadow-[0_2px_4px_rgba(15,23,42,0.05)] transition active:scale-[0.99]"
        >
          Host a Game
        </Link>
      </div>

      <div className="relative h-64 w-full overflow-hidden rounded-xl shadow-[0_10px_15px_-3px_rgba(15,23,42,0.1)]">
        <img
          src={mobileHeroImage}
          alt="Players competing in a local outdoor basketball game"
          className="size-full object-cover"
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
          <span className="rounded bg-[#ca3700] px-2 py-1 text-sm font-semibold tracking-[0.05em] text-white backdrop-blur-sm">
            Live Now
          </span>
        </div>
      </div>
    </section>
  );
}

function MobileTrendingSection() {
  return (
    <section className="bg-white px-4 py-6">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-2xl font-semibold leading-8 text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
          Trending Sports
        </h2>
        <Link to="/login" className="inline-flex items-center gap-1 text-xs font-medium text-[#004ac6]">
          View all
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {mobileTrendingSports.map((sport) => (
          <MobileTrendingCard key={sport.title} sport={sport} />
        ))}
      </div>
    </section>
  );
}

function MobileTrendingCard({ sport }: { sport: (typeof mobileTrendingSports)[number] }) {
  const Icon = sport.icon;

  return (
    <article className="flex items-center gap-4 overflow-hidden rounded-xl border border-[#c3c6d7] bg-[#f8f9ff] p-4 shadow-[0_2px_4px_rgba(15,23,42,0.05)]">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#dce9ff] text-[#004ac6]">
        <Icon className="size-6" />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <h3 className="truncate text-sm font-semibold tracking-[0.08em] text-[#0b1c30]">{sport.title}</h3>
        <p className="mt-1 flex items-center gap-1 truncate text-xs font-medium text-[#434655]">
          <MapPinIcon className="size-3.5 shrink-0" />
          {sport.location}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            sport.isFull ? "bg-[#ffdad6] text-[#ba1a1a]" : "bg-[#dce9ff] text-[#004ac6]"
          }`}
        >
          {sport.capacity}
        </span>
        <Link
          to="/login"
          aria-disabled={sport.isFull}
          className={`inline-flex h-7 items-center justify-center rounded-lg px-3 text-xs font-medium ${
            sport.isFull ? "bg-[#dce9ff] text-[#565e74] opacity-60" : "bg-[#2563eb] text-white"
          }`}
        >
          {sport.action}
        </Link>
      </div>
    </article>
  );
}

function MobileHostSection() {
  return (
    <section className="border-t border-[#c3c6d7] bg-[#eff4ff] px-4 py-6">
      <div className="rounded-2xl bg-[#f8f9ff] p-6 text-left shadow-[0_10px_15px_-3px_rgba(15,23,42,0.1)]">
        <h2 className="mb-2 text-2xl font-semibold leading-8 text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
          Organize with Ease
        </h2>
        <p className="mb-5 text-base leading-6 text-[#434655]">
          Managing your regular pickup games has never been simpler. Track attendance, collect fees, and keep everyone
          updated.
        </p>
        <ul className="mb-5 flex flex-col gap-2">
          {mobileHostBullets.map((bullet) => (
            <li key={bullet} className="flex items-center gap-2 text-sm font-semibold tracking-[0.05em] text-[#434655]">
              <CheckCircle2Icon className="size-5 text-[#004ac6]" />
              {bullet}
            </li>
          ))}
        </ul>
        <Link
          to="/login"
          className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#0b1c30] text-sm font-semibold tracking-[0.05em] text-white shadow-sm transition active:scale-[0.99]"
        >
          Become a Host
        </Link>
      </div>
    </section>
  );
}

function HeroSection() {
  const { playerCount, gameCount } = Route.useLoaderData();
  const numberFormatter = new Intl.NumberFormat();

  return (
    <section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.94fr_1.06fr]">
      <div className="flex flex-col gap-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#b4c5ff] bg-[#dce9ff] px-3 py-1 text-xs font-medium text-[#004ac6]">
          <TrophyIcon className="size-4" />
          The Ultimate Sports Hub
        </span>
        <div className="space-y-5">
          <h1 className="text-5xl font-extrabold leading-[0.97] tracking-tight text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif] md:text-6xl">
            Play Hard.
            <br />
            Organize Easy.
          </h1>
          <p className="max-w-xl text-base leading-7 text-[#565e74] md:text-lg">
            Create games, find players, manage rosters, and keep everyone updated. Trego brings the athletic community
            together, ensuring you're always ready to play.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            to="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#2563eb] px-6 text-sm font-semibold text-white transition hover:bg-[#003ea8]"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#c3c6d7] bg-[#dce9ff] px-6 text-sm font-semibold text-[#0b1c30] transition hover:bg-[#d3e4fe]"
          >
            Browse Games
          </Link>
        </div>
        <div className="mt-6 flex items-center gap-6 border-t border-[#c3c6d7] pt-7">
          <StatBlock value={numberFormatter.format(playerCount)} label="Registered Players" />
          <div className="h-10 w-px bg-[#c3c6d7]" />
          <StatBlock value={numberFormatter.format(gameCount)} label="Games Hosted" />
        </div>
      </div>

      <div className="group relative min-h-[360px] overflow-hidden rounded-2xl shadow-[0_24px_60px_rgba(15,23,42,0.2)] md:min-h-[500px]">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSwPvhcUDsIxQuvxvoAYf3j5iiycItTcrvAxOpbiGvNNbeNwpVAqZ-7WGhmm1Da-iV0Js6gd0Adfla0MpKb3nas3lEfJJ5PQ0RVo_5AsOrFdPXLoPduLofNrqeLJHS3ZyReVjvfp4j8Y9yNKVIRltTD7XMfnaIKiUfY3pOGyOT3y577sparquIKLDhBQ8B2rtfAlnINGXhekXeuVSTxTnX4wdjqWsXpmBZnp-udOkl9lk9dLobK55g4Jb0r461Xq48rnP_LL59WzM"
          alt="Athletes playing a fast-paced basketball game on an urban court at dusk"
          className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/80 via-[#0b1c30]/10 to-transparent" />
        <div className="absolute left-5 right-5 bottom-5 rounded-xl border border-white/25 bg-[#f8f9ff]/90 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#ca3700] text-white">
                <DumbbellIcon className="size-6" />
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-[0.05em] text-[#0b1c30]">Downtown Shootout</h2>
                <p className="text-xs font-medium text-[#565e74]">Live Now • 14 Players</p>
              </div>
            </div>
            <span className="rounded-full bg-[#ba1a1a] px-3 py-1 text-xs font-semibold text-white">Live</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function LiveGamesSection() {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif] md:text-4xl">
            Live Games Near You
          </h2>
          <p className="text-base text-[#565e74]">Join the action happening in your area right now.</p>
        </div>
        <Link to="/login" className="hidden text-sm font-semibold text-[#004ac6] hover:underline sm:block">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {liveGames.map((game) => (
          <GameCard key={game.title} game={game} />
        ))}
      </div>

      <Link
        to="/login"
        className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-[#c3c6d7] text-sm font-semibold text-[#004ac6] sm:hidden"
      >
        View All Games
      </Link>
    </section>
  );
}

function GameCard({ game }: { game: (typeof liveGames)[number] }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-100 bg-white/90 shadow-[0_2px_4px_rgba(15,23,42,0.05)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-32 bg-[#e5eeff]">
        <img src={game.image} alt="" className="absolute inset-0 size-full object-cover opacity-80" />
        <div className="absolute top-4 right-4 flex items-center gap-1 rounded bg-[#f8f9ff] px-2 py-1 text-xs font-medium text-[#0b1c30] shadow-sm">
          <ClockIcon className="size-4 text-[#ca3700]" />
          {game.time}
        </div>
        <div className="absolute -bottom-6 left-4 flex size-12 items-center justify-center rounded-full border-4 border-white bg-[#0053db] text-white">
          <DumbbellIcon className="size-6" />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 pt-8">
        <div>
          <h3 className="text-2xl font-semibold leading-8 text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
            {game.title}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm font-semibold tracking-[0.05em] text-[#565e74]">
            <MapPinIcon className="size-4" />
            {game.location}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-full bg-[#b4c5ff] text-xs font-medium text-[#0b1c30]">
              {game.initial}
            </div>
            <span className="text-xs font-medium text-[#565e74]">Host: {game.host}</span>
          </div>
          <span className={`rounded px-2 py-1 text-xs font-medium ${game.levelClass}`}>{game.level}</span>
        </div>

        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-xs font-medium text-[#565e74]">
            <span>Spots Filled</span>
            <span>{game.spots}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#e5eeff]">
            <div className="h-full rounded-full bg-[#2563eb]" style={{ width: game.progress }} />
          </div>
        </div>

        <Link
          to="/login"
          className={`mt-2 inline-flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold transition ${game.actionClass}`}
        >
          Join Game
        </Link>
      </div>
    </article>
  );
}

function OrganizerSection() {
  return (
    <section className="rounded-3xl border border-[#c3c6d7] bg-[#eff4ff] p-8 md:p-12">
      <div className="flex flex-col items-center gap-12 lg:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#004ac6]">For Organizers</span>
          <div className="space-y-5">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif] md:text-5xl">
              Command Your Court
            </h2>
            <p className="max-w-xl text-lg leading-7 text-[#565e74]">
              Powerful tools designed for hosts who take their games seriously. Manage every detail without breaking a
              sweat.
            </p>
          </div>

          <ul className="mt-2 flex flex-col gap-4">
            {organizerFeatures.map((feature) => (
              <OrganizerFeature key={feature.title} feature={feature} />
            ))}
          </ul>

          <Link
            to="/login"
            className="mt-2 inline-flex h-11 w-fit items-center justify-center rounded-lg bg-[#2563eb] px-6 text-sm font-semibold text-white transition hover:bg-[#003ea8]"
          >
            Start Hosting
          </Link>
        </div>

        <div className="grid w-full flex-1 grid-cols-2 gap-4">
          <div className="col-span-2 flex items-center justify-between rounded-xl border border-slate-100 bg-white/90 p-4 shadow-[0_2px_4px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-3">
              <IconBubble icon={MailIcon} className="bg-[#2563eb] text-white" />
              <div>
                <h3 className="text-sm font-semibold tracking-[0.05em] text-[#0b1c30]">Automated Invites</h3>
                <p className="text-xs font-medium text-[#565e74]">Sent to 24 regulars</p>
              </div>
            </div>
            <CheckCircle2Icon className="size-5 text-[#0b1c30]" />
          </div>
          <MiniPanel icon={Repeat2Icon} title="Ownership Transfer" description="Pass the torch easily" />
          <MiniPanel
            icon={BarChart3Icon}
            title="Player Stats"
            description="Track reliability"
            className="bg-[#0b1c30] text-white"
            mutedClassName="text-[#c3c6d7]"
            iconClassName="text-[#b4c5ff]"
          />
        </div>
      </div>
    </section>
  );
}

function OrganizerFeature({ feature }: { feature: { icon: IconComponent; title: string; description: string } }) {
  const Icon = feature.icon;

  return (
    <li className="flex items-start gap-3">
      <Icon className="mt-1 size-5 text-[#004ac6]" />
      <div>
        <h3 className="text-sm font-semibold tracking-[0.05em] text-[#0b1c30]">{feature.title}</h3>
        <p className="text-sm text-[#565e74]">{feature.description}</p>
      </div>
    </li>
  );
}

function StepsSection() {
  return (
    <section className="flex flex-col items-center gap-12 py-8">
      <div className="flex max-w-2xl flex-col gap-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif] md:text-4xl">
          Get in the Game in 3 Steps
        </h2>
        <p className="text-base text-[#565e74]">
          No complex onboarding. Just sign up, find your sport, and start playing.
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-3">
        {steps.map((step, index) => (
          <StepCard key={step.title} step={step} index={index} />
        ))}
      </div>
    </section>
  );
}

function StepCard({ step, index }: { step: (typeof steps)[number]; index: number }) {
  const active = index === 1;

  return (
    <div className="relative flex flex-col items-center gap-4 text-center">
      <div
        className={`z-10 flex size-16 items-center justify-center rounded-full border-2 text-2xl font-semibold ${
          active
            ? "border-[#2563eb] bg-[#2563eb] text-white shadow-lg shadow-blue-600/20"
            : "border-[#c3c6d7] bg-[#dce9ff] text-[#004ac6]"
        }`}
      >
        {index + 1}
      </div>
      {index < steps.length - 1 ? (
        <div className="absolute top-8 left-1/2 hidden h-px w-full border-t-2 border-dashed border-[#c3c6d7] md:block" />
      ) : null}
      <h3 className="mt-2 text-2xl font-semibold leading-8 text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
        {step.title}
      </h3>
      <p className="max-w-xs text-base leading-6 text-[#565e74]">{step.description}</p>
    </div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-2xl font-semibold leading-8 text-[#0b1c30]">{value}</span>
      <span className="text-xs font-medium text-[#565e74]">{label}</span>
    </div>
  );
}

function IconBubble({ icon: Icon, className = "" }: { icon: IconComponent; className?: string }) {
  return (
    <div className={`flex size-10 items-center justify-center rounded-full ${className}`}>
      <Icon className="size-5" />
    </div>
  );
}

function MiniPanel({
  icon: Icon,
  title,
  description,
  className = "bg-white/90 text-[#0b1c30]",
  mutedClassName = "text-[#565e74]",
  iconClassName = "text-[#ca3700]",
}: {
  icon: IconComponent;
  title: string;
  description: string;
  className?: string;
  mutedClassName?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={`flex min-h-44 flex-col items-center justify-center gap-4 rounded-xl border border-slate-100 p-6 text-center shadow-[0_2px_4px_rgba(15,23,42,0.05)] ${className}`}
    >
      <Icon className={`size-8 ${iconClassName}`} />
      <div>
        <h3 className="text-sm font-semibold tracking-[0.05em]">{title}</h3>
        <p className={`mt-1 text-xs font-medium ${mutedClassName}`}>{description}</p>
      </div>
    </div>
  );
}
