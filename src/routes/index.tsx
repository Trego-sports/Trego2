import { createFileRoute, ErrorComponent, Link } from "@tanstack/react-router";
import { ChevronRightIcon, ClockIcon, MapPinIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomePage,
  errorComponent: ErrorComponent,
});

const liveGames = [
  {
    sport: "Basketball",
    title: "CIF evening run",
    time: "Tonight 7:30",
    players: "8/10",
    distance: "1.2 km",
    host: "Maya",
    tone: "bg-[#E8791F]",
  },
  {
    sport: "Football",
    title: "Waterloo Park 7s",
    time: "Sat 10:00",
    players: "13/16",
    distance: "2.8 km",
    host: "Arjun",
    tone: "bg-[#0B8F68]",
  },
  {
    sport: "Badminton",
    title: "PAC doubles ladder",
    time: "Sun 4:15",
    players: "3/4",
    distance: "0.7 km",
    host: "Elena",
    tone: "bg-[#2D6CDF]",
  },
];

const steps = [
  {
    title: "Match",
    body: "Sports, skill, distance, and availability narrow the field.",
  },
  {
    title: "Join",
    body: "Roster, host, capacity, and rules are clear before you commit.",
  },
  {
    title: "Host",
    body: "Invites, announcements, ownership, and attendance stay organized.",
  },
];

function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#ECE5DA] text-[#17243B] antialiased">
      <section className="relative min-h-[840px] px-4 pb-20 pt-5 sm:px-6 lg:min-h-[900px] lg:px-8 lg:pb-24 lg:pt-6">
        <div className="court-wash absolute inset-0" />
        <div className="absolute inset-x-4 top-24 hidden h-[650px] overflow-hidden rounded-[48px] bg-[#17243B] shadow-[0_34px_110px_rgba(23,36,59,0.32)] md:block lg:inset-x-8 lg:h-[690px] lg:rounded-[56px] xl:h-[710px]">
          <div className="court-lines absolute inset-0 opacity-35" />
          <div className="absolute left-[43%] top-0 h-full w-px bg-white/12" />
          <div className="absolute left-[43%] top-1/2 h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/18" />
          <div className="absolute right-[-12%] top-[-22%] h-[560px] w-[560px] rounded-full bg-[#E8791F]/12 blur-3xl" />
        </div>

        <MarketingHeader />

        <div className="relative z-10 mx-auto mt-16 grid max-w-[1500px] gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(460px,0.92fr)] lg:items-center lg:gap-16 lg:px-14 xl:px-20">
          <div className="landing-hero-copy max-w-[790px] text-white">
            <div className="inline-flex rounded-full bg-[#E8791F] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] shadow-[0_14px_34px_rgba(232,121,31,0.32)]">
              Pickup sports, coordinated
            </div>
            <h1 className="mt-6 text-[clamp(4.5rem,7.8vw,7.75rem)] font-black leading-[0.84] text-balance">Trego</h1>
            <p className="mt-6 max-w-[760px] text-[clamp(2.15rem,3.2vw,3rem)] font-black leading-[1.02] text-white text-balance">
              Find the right game, join the right roster, and keep everyone on the same court.
            </p>
            <p className="mt-7 max-w-[650px] text-lg font-semibold leading-9 text-white/72 text-pretty">
              Trego turns group-chat pickup games into a clear flow for players and hosts: sports, location, roster,
              capacity, reminders, and attendance in one place.
            </p>

            <div className="landing-hero-actions mt-9 flex flex-wrap gap-3">
              <Button
                render={<Link to="/login" />}
                size="lg"
                className="min-h-12 rounded-full bg-[#E8791F] px-6 font-black text-white shadow-[0_18px_34px_rgba(232,121,31,0.28)] hover:bg-[#F39A3D]"
              >
                Get started
                <ChevronRightIcon />
              </Button>
              <a
                href="#games"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-black text-[#17243B] shadow-[0_14px_28px_rgba(23,36,59,0.14)] transition-colors hover:bg-[#FFF1E3]"
              >
                See live games
              </a>
            </div>
          </div>

          <div id="games" className="relative mx-auto grid w-full max-w-[560px] gap-5 lg:mx-0 lg:justify-self-end">
            <div className="absolute -left-10 top-10 hidden h-28 w-28 rounded-full border border-white/16 xl:block" />
            {liveGames.map((game, index) => (
              <article
                key={game.title}
                className="ticket relative overflow-hidden rounded-[30px] bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_24px_54px_rgba(23,36,59,0.18)]"
                style={{ animationDelay: `${120 + index * 90}ms` }}
              >
                <div className={`absolute left-0 top-0 h-full w-2 ${game.tone}`} />
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#FFF1E3] px-3 py-1 text-xs font-black text-[#A94C08]">
                    {game.sport}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-[#6B7280] tabular-nums">
                    <UsersIcon className="size-3.5" />
                    {game.players}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-black leading-tight text-[#17243B] text-balance">{game.title}</h2>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm font-bold text-[#596373]">
                  <span className="inline-flex items-center gap-1.5">
                    <ClockIcon className="size-4" />
                    {game.time}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPinIcon className="size-4" />
                    {game.distance}
                  </span>
                  <span>Host {game.host}</span>
                </div>
                <Button
                  render={<Link to="/login" />}
                  className="mt-5 min-h-12 w-full rounded-full bg-[#17243B] text-sm font-black text-white hover:bg-[#E8791F]"
                >
                  Join game
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#ECE5DA] px-4 pb-24 sm:px-6 lg:px-8">
        <div id="how" className="mx-auto grid max-w-[1500px] gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[34px] bg-white/92 p-7 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_18px_46px_rgba(23,36,59,0.12)] backdrop-blur"
              style={{ animationDelay: `${360 + index * 100}ms` }}
            >
              <span className="text-sm font-black text-[#E8791F] tabular-nums">0{index + 1}</span>
              <h2 className="mt-3 text-xl font-black text-[#17243B] text-balance">{step.title}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#596373] text-pretty">{step.body}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-8 grid max-w-[1500px] gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <article
            id="hosts"
            className="overflow-hidden rounded-[40px] bg-[#101B2E] p-8 text-white shadow-[0_28px_80px_rgba(23,36,59,0.24)] lg:p-10"
          >
            <div className="flex max-w-3xl items-start gap-5">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#E8791F]">
                <ShieldCheckIcon className="size-7" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#E8791F]">For hosts</p>
                <h2 className="mt-3 text-3xl font-black leading-tight text-balance lg:text-5xl">
                  Keep games moving without chasing the group chat.
                </h2>
                <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-white/70">
                  Manage capacity, invites, ownership, announcements, and attendance from one place before game day.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[40px] bg-white/80 p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_20px_54px_rgba(23,36,59,0.12)] backdrop-blur lg:p-10">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#E8791F]">Built for repeat play</p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div>
                <p className="text-5xl font-black tracking-[-0.05em] text-[#17243B] tabular-nums">3</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#596373]">quick decisions before joining</p>
              </div>
              <div>
                <p className="text-5xl font-black tracking-[-0.05em] text-[#17243B] tabular-nums">10</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[#596373]">players tracked without spreadsheets</p>
              </div>
            </div>
            <Button
              render={<Link to="/login" />}
              size="lg"
              className="mt-9 min-h-12 rounded-full bg-[#E8791F] px-6 font-black text-white shadow-[0_18px_34px_rgba(232,121,31,0.24)] hover:bg-[#F39A3D]"
            >
              Start organizing
              <ChevronRightIcon />
            </Button>
          </article>
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
