import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDaysIcon, ShieldCheckIcon, TrophyIcon } from "lucide-react";
import { $loginWithGoogle } from "@/lib/auth/google";
import { $getUserId } from "@/lib/session";
import googleLogo from "@/static/google-logo.svg";
import tregoLogo from "@/static/trego1.avif";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  beforeLoad: async () => {
    const userId = await $getUserId();
    if (userId) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

function LoginPage() {
  const loginWithGoogle = useServerFn($loginWithGoogle);
  const googleLoginMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: (data) => {
      window.location.href = data.redirectUrl;
    },
  });

  const handleGoogleLogin = () => {
    googleLoginMutation.mutate({});
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <main className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] [font-family:Inter,ui-sans-serif,system-ui,sans-serif]">
        <DesktopLoginPage onGoogleLogin={handleGoogleLogin} isSigningIn={googleLoginMutation.isPending} />
        <MobileLoginPage onGoogleLogin={handleGoogleLogin} isSigningIn={googleLoginMutation.isPending} />
      </main>
    </>
  );
}

function DesktopLoginPage({ onGoogleLogin, isSigningIn }: { onGoogleLogin: () => void; isSigningIn: boolean }) {
  return (
    <div className="hidden min-h-screen md:grid md:grid-cols-2">
      <section className="flex min-h-screen flex-col justify-between px-12 py-12 lg:px-24">
        <Link to="/" className="flex w-fit items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex size-12 items-center justify-center overflow-hidden rounded-lg border border-[#c3c6d7] bg-[#dce9ff]">
            <img src={tregoLogo} alt="Trego Logo" className="size-full object-contain p-2" />
          </div>
          <span className="text-2xl font-semibold tracking-tight text-[#004ac6] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
            Trego
          </span>
        </Link>

        <section className="mx-auto flex w-full max-w-md flex-col">
          <h1 className="mb-2 text-5xl font-extrabold leading-[1.08] tracking-tight text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
            Get ready to play.
          </h1>
          <p className="mb-6 text-lg leading-7 text-[#434655]">Join the community, find games, and hit the court.</p>

          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={isSigningIn}
            className="mb-4 inline-flex h-14 w-full items-center justify-center gap-3 rounded-lg border border-[#c3c6d7] bg-white px-6 text-sm font-semibold tracking-[0.08em] text-[#0b1c30] shadow-sm transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <img src={googleLogo} alt="" className="size-5" />
            {isSigningIn ? "Connecting..." : "Continue with Google"}
          </button>

          <div className="flex items-start gap-3 rounded-lg border border-[#b4c5ff] bg-[#e5eeff] p-4">
            <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-[#004ac6]" />
            <p className="text-sm leading-6 text-[#434655]">
              Google is used for secure sign-in and optional calendar sync. We never post on your behalf.
            </p>
          </div>
        </section>

        <LegalCopy align="left" />
      </section>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden border-l border-[#c3c6d7] bg-[#eff4ff] p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#dbe1ff_0%,#eff4ff_52%,#e5eeff_100%)] opacity-80" />
        <DesktopPreviewCard />
      </section>
    </div>
  );
}

function MobileLoginPage({ onGoogleLogin, isSigningIn }: { onGoogleLogin: () => void; isSigningIn: boolean }) {
  return (
    <div className="flex min-h-screen flex-col md:hidden">
      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8">
        <Link to="/" className="transition-opacity hover:opacity-80">
          <img src={tregoLogo} alt="Trego Logo" className="size-32 object-contain" />
        </Link>

        <section className="w-full rounded-xl border border-[#c3c6d7] bg-white p-6 text-center shadow-[0_2px_4px_rgba(15,23,42,0.05)]">
          <h1 className="mb-2 text-[28px] font-bold leading-9 text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
            Get in the Game
          </h1>
          <p className="mb-6 text-base leading-6 text-[#565e74]">Join your local sports community today.</p>

          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={isSigningIn}
            className="mb-6 grid h-16 w-full grid-cols-[1fr_1fr] items-center rounded-lg bg-[#004ac6] px-4 text-white shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="text-left text-3xl font-normal tracking-[0.12em]">GOOGLE</span>
            <span className="text-lg font-semibold leading-6 tracking-[0.08em]">
              {isSigningIn ? "Connecting..." : "Continue with Google"}
            </span>
          </button>

          <p className="px-2 text-sm leading-6 text-[#434655]">
            We use Google to seamlessly sync your upcoming games with your calendar and verify your local sports
            community identity.
          </p>
        </section>

        <MobilePreviewCard />
      </section>

      <footer className="flex justify-center gap-8 border-t border-[#c3c6d7] px-4 py-6">
        <FooterLegalLink to="/privacy">Privacy Policy</FooterLegalLink>
        <FooterLegalLink to="/terms">Terms of Service</FooterLegalLink>
      </footer>
    </div>
  );
}

function DesktopPreviewCard() {
  return (
    <article className="relative z-10 flex w-full max-w-sm flex-col gap-4 rounded-xl border border-[#c3c6d7] bg-white p-4 shadow-[0_10px_15px_-3px_rgba(15,23,42,0.1)] transition duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <SportIcon className="size-10" />
          <div>
            <h2 className="text-lg font-bold leading-6 text-[#0b1c30]">Downtown Pick-up</h2>
            <p className="text-xs font-medium text-[#434655]">Basketball - Intermediate</p>
          </div>
        </div>
        <span className="rounded-full bg-[#2563eb] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-white">
          Live
        </span>
      </div>

      <div className="rounded-lg border border-[#d3e4fe] bg-[#eff4ff] p-3">
        <div className="mb-2 flex items-end justify-between">
          <span className="text-xs font-medium text-[#434655]">Roster Status</span>
          <span className="text-sm font-bold tracking-[0.05em] text-[#004ac6]">3 spots left</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#d3e4fe]">
          <div className="h-full w-3/4 rounded-full bg-[#2563eb]" />
        </div>
        <div className="mt-3 flex -space-x-2">
          <RosterInitials label="MJ" className="bg-[#dae2fd] text-[#5c647a]" />
          <RosterInitials label="KB" className="bg-[#ca3700] text-white" />
          <RosterInitials label="LB" className="bg-[#dbe1ff] text-[#00174b]" />
          <RosterInitials label="+6" className="bg-[#d3e4fe] text-[#434655]" />
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-[#b4c5ff] bg-[#eaf1ff] p-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-[#004ac6]">
          <CalendarDaysIcon className="size-4" />
        </div>
        <p className="text-xs leading-5 text-[#434655]">Syncs automatically to your Google Calendar when you join.</p>
      </div>
    </article>
  );
}

function MobilePreviewCard() {
  return (
    <section className="w-full">
      <p className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#565e74]">Live Preview</p>
      <article className="rounded-lg border border-[#c3c6d7] bg-white p-4 shadow-[0_2px_4px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <SportIcon className="size-10 shrink-0" />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold tracking-[0.08em] text-[#0b1c30]">Downtown 5v5 Pickup</h2>
              <p className="text-sm text-[#565e74]">Tonight, 7:00 PM</p>
            </div>
          </div>
          <span className="rounded bg-[#2563eb] px-3 py-2 text-sm font-medium text-white">Intermediate</span>
        </div>

        <div className="mb-1 flex justify-between text-sm text-[#434655]">
          <span>Roster Status</span>
          <span>8/10 Players</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#d3e4fe]">
          <div className="h-full w-4/5 rounded-full bg-[#004ac6]" />
        </div>
      </article>
    </section>
  );
}

function LegalCopy({ align }: { align: "left" | "center" }) {
  return (
    <p className={`text-xs text-[#434655] ${align === "left" ? "text-left" : "text-center"}`}>
      By continuing, you agree to our <LegalLink to="/terms">Terms of Service</LegalLink> and{" "}
      <LegalLink to="/privacy">Privacy Policy</LegalLink>.
    </p>
  );
}

function LegalLink({ to, children }: { to: "/privacy" | "/terms"; children: string }) {
  return (
    <Link to={to} className="font-medium text-[#004ac6] hover:underline">
      {children}
    </Link>
  );
}

function FooterLegalLink({ to, children }: { to: "/privacy" | "/terms"; children: string }) {
  return (
    <Link to={to} className="text-sm font-medium text-[#565e74] transition hover:text-[#004ac6]">
      {children}
    </Link>
  );
}

function SportIcon({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-full bg-[#dce9ff] text-[#004ac6] ${className ?? ""}`}>
      <TrophyIcon className="size-5" />
    </div>
  );
}

function RosterInitials({ label, className }: { label: string; className: string }) {
  return (
    <div
      className={`flex size-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold ${className}`}
    >
      {label}
    </div>
  );
}
