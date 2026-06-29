import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDaysIcon, ChevronLeftIcon, ClockIcon, MapPinIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";
import { MarketingFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
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

const loginHighlights = [
  { icon: CalendarDaysIcon, label: "Game schedule" },
  { icon: UsersIcon, label: "Roster status" },
  { icon: ShieldCheckIcon, label: "Host controls" },
] as const;

function LoginPage() {
  const loginWithGoogle = useServerFn($loginWithGoogle);
  const googleLoginMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: (data) => {
      window.location.href = data.redirectUrl;
    },
  });

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-[#ECE5DA] text-[#17243B] antialiased">
        <div className="court-wash absolute inset-0" />
        <div className="absolute inset-x-4 bottom-4 top-4 hidden overflow-hidden rounded-[52px] bg-[#17243B] shadow-[0_34px_110px_rgba(23,36,59,0.32)] lg:block xl:inset-x-8">
          <div className="court-lines absolute inset-0 opacity-35" />
          <div className="absolute left-[58%] top-0 h-full w-px bg-white/12" />
          <div className="absolute left-[58%] top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/18" />
          <div className="absolute right-[-14%] top-[-18%] h-[620px] w-[620px] rounded-full bg-[#E8791F]/14 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] flex-col px-4 py-5 sm:px-6 lg:px-12 xl:px-20">
          <header className="login-header flex items-center justify-between gap-4">
            <Link
              className="group flex min-h-14 items-center gap-3 rounded-full bg-white/92 py-2 pl-2 pr-5 shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_16px_38px_rgba(23,36,59,0.12)] backdrop-blur transition-[background-color,box-shadow,transform] duration-200 hover:bg-white hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_18px_44px_rgba(23,36,59,0.16)] active:scale-[0.96]"
              to="/"
            >
              <img
                src={tregoLogo}
                alt="Trego"
                className="h-12 w-12 rounded-full object-contain outline outline-1 -outline-offset-1 outline-black/10"
              />
              <span>
                <span className="block text-xl font-black leading-none text-[#17243B]">Trego</span>
                <span className="mt-0.5 block text-[11px] font-black uppercase tracking-[0.12em] text-[#E8791F]">
                  Play starts here
                </span>
              </span>
            </Link>

            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/86 px-5 text-sm font-black text-[#17243B] shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_14px_28px_rgba(23,36,59,0.12)] backdrop-blur transition-[background-color,box-shadow,transform] duration-200 hover:bg-[#FFF1E3] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_18px_34px_rgba(23,36,59,0.16)] active:scale-[0.96]"
              to="/"
            >
              <ChevronLeftIcon className="size-4" />
              Back home
            </Link>
          </header>

          <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(390px,0.72fr)] lg:gap-14 lg:py-12 xl:gap-20">
            <div className="login-copy max-w-[760px] text-[#17243B] lg:text-white">
              <div className="inline-flex rounded-full bg-[#E8791F] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_34px_rgba(232,121,31,0.32)]">
                Player login
              </div>
              <h1 className="mt-6 max-w-[720px] text-[clamp(3.6rem,6.4vw,7rem)] font-black leading-[0.88] text-balance">
                Everything for game day, one sign-in away.
              </h1>
              <p className="mt-7 max-w-[620px] text-lg font-semibold leading-8 text-[#596373] text-pretty lg:text-white/72">
                Get back to your roster, upcoming runs, host tools, and reminders without digging through a group chat.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {loginHighlights.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      className="login-highlight inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-[#17243B] shadow-[0_12px_28px_rgba(23,36,59,0.12)] lg:bg-white/12 lg:text-white lg:shadow-none lg:ring-1 lg:ring-white/12"
                      key={item.label}
                      style={{ animationDelay: `${300 + index * 90}ms` }}
                    >
                      <Icon className="size-4 text-[#E8791F]" />
                      {item.label}
                    </div>
                  );
                })}
              </div>

              <article className="login-preview-card mt-10 hidden max-w-[470px] overflow-hidden rounded-[34px] bg-white p-6 text-[#17243B] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_24px_54px_rgba(23,36,59,0.18)] md:block">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#FFF1E3] px-3 py-1 text-xs font-black text-[#A94C08]">
                    Basketball
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-[#6B7280] tabular-nums">
                    <UsersIcon className="size-3.5" />
                    8/10
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-black leading-tight text-balance">CIF evening run</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-bold text-[#596373]">
                  <span className="inline-flex items-center gap-1.5">
                    <ClockIcon className="size-4" />
                    Tonight 7:30
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPinIcon className="size-4" />
                    1.2 km
                  </span>
                </div>
              </article>
            </div>

            <section
              aria-labelledby="login-title"
              className="login-auth-card mx-auto w-full max-w-[500px] rounded-[44px] bg-white/96 p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_34px_88px_rgba(23,36,59,0.26)] backdrop-blur"
            >
              <div className="rounded-[32px] bg-[#F8F2E9] p-6 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={tregoLogo}
                      alt=""
                      aria-hidden="true"
                      className="h-12 w-12 rounded-full object-contain outline outline-1 -outline-offset-1 outline-black/10"
                    />
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#E8791F]">Secure access</p>
                      <h2
                        id="login-title"
                        className="mt-1 text-3xl font-black leading-none text-[#17243B] text-balance"
                      >
                        Sign in to Trego
                      </h2>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-base font-semibold leading-7 text-[#596373] text-pretty">
                  Continue with Google to pick up where your games, teams, and host tools left off.
                </p>

                <Button
                  aria-busy={googleLoginMutation.isPending}
                  className="mt-8 min-h-14 w-full rounded-full bg-white px-5 text-base font-black text-[#17243B] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_16px_38px_rgba(23,36,59,0.12)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-[#FFF1E3] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_20px_46px_rgba(23,36,59,0.16)] active:scale-[0.96]"
                  disabled={googleLoginMutation.isPending}
                  onClick={() => googleLoginMutation.mutate({})}
                  size="lg"
                  type="button"
                  variant="outline"
                >
                  <img src={googleLogo} alt="" aria-hidden="true" className="size-5" />
                  {googleLoginMutation.isPending ? "Opening Google..." : "Continue with Google"}
                </Button>

                {googleLoginMutation.isError ? (
                  <p className="mt-4 rounded-[22px] bg-[#FFF1E3] px-4 py-3 text-sm font-bold leading-6 text-[#A94C08] shadow-[inset_0_0_0_1px_rgba(232,121,31,0.18)]">
                    Google sign-in did not start. Try again in a moment.
                  </p>
                ) : null}

                <div className="mt-7 flex items-start gap-3 rounded-[26px] bg-[#17243B] p-4 text-white shadow-[0_18px_42px_rgba(23,36,59,0.18)]">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E8791F]">
                    <ShieldCheckIcon className="size-5" />
                  </span>
                  <p className="text-sm font-semibold leading-6 text-white/74 text-pretty">
                    OAuth keeps your Google password with Google. Trego only receives the profile details needed to sign
                    you in.
                  </p>
                </div>
              </div>
            </section>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
