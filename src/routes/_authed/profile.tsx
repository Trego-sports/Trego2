import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import { BellIcon, MapPinIcon, ShieldCheckIcon, TrophyIcon, UsersIcon } from "lucide-react";
import { CalendarSettingsCard } from "@/components/calendar/calendar-settings-card";
import { ProfileForm as ProfileFormComponent } from "@/components/forms/profile-form";
import { AttendanceStatsCard } from "@/components/profile/attendance-stats-card";
import { ProfileAvatarUpload } from "@/components/profile/profile-avatar-upload";
import { userQueries } from "@/modules/profile/queries";

export const Route = createFileRoute("/_authed/profile")({
  component: ProfilePage,
  errorComponent: ErrorComponent,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(userQueries.getMyProfile());
  },
});

function ProfilePage() {
  const { data: myProfile } = useSuspenseQuery(userQueries.getMyProfile());
  const attendanceScore = myProfile.attendanceStats.attendanceScore ?? 0;
  const profileStrength = getProfileStrength(myProfile);
  const locationLabel = myProfile.location ? "Location enabled" : "Location not set";

  return (
    <div className="-mx-4 -mt-8 min-h-[calc(100vh-4rem)] bg-[#f7f9fb] px-4 py-8 text-[#0b1c30] md:-mx-8 md:-mt-10 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.08em] text-[#004ac6]">Player identity</p>
            <h1 className="mt-1 text-4xl font-black tracking-tight text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
              My Profile
            </h1>
          </div>
          <div className="rounded-lg border border-[#c3c6d7] bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-[#647086]">Profile Strength</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 w-32 overflow-hidden rounded-full bg-[#d8dee8]">
                <div className="h-full rounded-full bg-[#004ac6]" style={{ width: `${profileStrength}%` }} />
              </div>
              <span className="text-sm font-black text-[#004ac6] tabular-nums">{profileStrength}%</span>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="rounded-lg border border-[#c3c6d7] bg-white p-6 text-center shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
              <ProfileAvatarUpload name={myProfile.name} profilePictureUrl={myProfile.profilePictureUrl} />
              <h2 className="mt-5 text-3xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
                {myProfile.name}
              </h2>
              <p className="mt-2 inline-flex items-center justify-center gap-2 text-base font-semibold text-[#647086]">
                <MapPinIcon className="size-5" />
                {locationLabel}
              </p>

              <div className="mt-7 border-t border-[#d8def0] pt-6 text-left">
                <div className="flex items-center justify-between">
                  <p className="font-black text-[#647086]">Attendance Reliability</p>
                  <p className="text-xl font-black text-[#004ac6] tabular-nums">{attendanceScore}%</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#d8dee8]">
                  <div
                    className="h-full rounded-full bg-[#004ac6]"
                    style={{ width: `${Math.min(attendanceScore, 100)}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-bold text-[#647086]">
                  Based on {myProfile.attendanceStats.markedCount} marked games.
                </p>
              </div>
            </section>

            <AttendanceStatsCard stats={myProfile.attendanceStats} />

            <section className="rounded-lg border border-[#c3c6d7] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
              <h2 className="text-xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
                My Sports
              </h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {myProfile.playerSports.length > 0 ? (
                  myProfile.playerSports.map((sport) => (
                    <div
                      key={`${sport.sport}-${sport.skillLevel}-${sport.position ?? ""}`}
                      className="inline-flex items-center gap-3 rounded-lg border border-[#d8def0] bg-[#f8f9ff] px-4 py-3"
                    >
                      <span className="flex size-9 items-center justify-center rounded-full bg-[#dce9ff] text-[#004ac6]">
                        <TrophyIcon className="size-4" />
                      </span>
                      <span>
                        <span className="block font-black text-[#0b1c30]">{sport.sport}</span>
                        <span className="text-xs font-black uppercase tracking-[0.08em] text-[#004ac6]">
                          {sport.skillLevel}
                        </span>
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-medium text-[#647086]">Add sports to unlock better recommendations.</p>
                )}
              </div>
            </section>
          </aside>

          <main className="space-y-6">
            <ProfileFormComponent />
            <section className="rounded-lg border border-[#c3c6d7] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
              <h2 className="text-xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
                Availability & Preferences
              </h2>
              <div className="mt-5 space-y-3">
                <PreferenceRow
                  icon={<BellIcon className="size-5" />}
                  title="Game Invites"
                  description="Receive notifications when invited to a game."
                  enabled
                />
                <PreferenceRow
                  icon={<UsersIcon className="size-5" />}
                  title="Public Profile"
                  description="Allow other users to see your stats and sports."
                  enabled
                />
              </div>
            </section>
            <CalendarSettingsCard />
            <section className="rounded-lg border border-[#c3c6d7] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
              <h2 className="text-xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
                Linked Accounts
              </h2>
              <div className="mt-4 grid gap-3">
                {myProfile.oauthAccounts.map((account) => (
                  <div
                    key={account.providerId}
                    className="flex items-center justify-between rounded-lg border border-[#d8def0] bg-[#f8f9ff] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-[#e5eeff] font-black uppercase text-[#004ac6]">
                        {account.providerId.charAt(0)}
                      </span>
                      <div>
                        <p className="font-black capitalize text-[#0b1c30]">{account.providerId}</p>
                        <p className="text-sm font-medium text-[#647086]">Connected</p>
                      </div>
                    </div>
                    <ShieldCheckIcon className="size-5 text-[#004ac6]" />
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function PreferenceRow({
  icon,
  title,
  description,
  enabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[#d8def0] bg-[#f8f9ff] p-4">
      <div className="flex items-center gap-4">
        <span className="flex size-10 items-center justify-center rounded-lg bg-[#e5eeff] text-[#004ac6]">{icon}</span>
        <span>
          <span className="block font-black text-[#0b1c30]">{title}</span>
          <span className="text-sm font-bold text-[#647086]">{description}</span>
        </span>
      </div>
      <span
        className={`relative h-8 w-14 rounded-full transition ${enabled ? "bg-[#004ac6]" : "bg-[#c3c6d7]"}`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-1 size-6 rounded-full bg-white shadow-sm transition ${enabled ? "right-1" : "left-1"}`}
        />
      </span>
    </div>
  );
}

function getProfileStrength(profile: {
  name: string;
  profilePictureUrl: string | null;
  location: unknown;
  playerSports: unknown[];
}) {
  let score = 40;
  if (profile.name.trim()) score += 15;
  if (profile.profilePictureUrl) score += 15;
  if (profile.location) score += 15;
  if (profile.playerSports.length > 0) score += 15;
  return Math.min(score, 100);
}
