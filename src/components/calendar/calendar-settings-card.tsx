import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarIcon, CheckCircle2Icon, ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useConnectGoogleCalendar,
  useDisconnectCalendar,
  useSetCalendarSyncEnabled,
} from "@/modules/calendar/mutations";
import { userQueries } from "@/modules/profile/queries";

export function CalendarSettingsCard() {
  const { data: profile } = useSuspenseQuery(userQueries.getMyProfile());
  const connectMutation = useConnectGoogleCalendar();
  const disconnectMutation = useDisconnectCalendar();
  const setSyncMutation = useSetCalendarSyncEnabled();

  const integration = profile.calendarIntegration;
  const connected = !!integration;

  return (
    <section className="rounded-lg border border-[#c3c6d7] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
            Connected Apps
          </h2>
          <p className="mt-1 text-sm font-medium text-[#647086]">Sync games and keep your schedule connected.</p>
        </div>
      </div>

      <div className="space-y-3">
        {!connected ? (
          <div className="flex flex-col gap-4 rounded-lg border border-[#d8def0] bg-[#f8f9ff] p-4 sm:flex-row sm:items-center sm:justify-between">
            <AppIdentity
              icon={<CalendarIcon className="size-5" />}
              title="Google Calendar"
              description="Automatically add upcoming games with a reminder."
            />
            <Button
              className="rounded-lg bg-[#004ac6] text-white hover:bg-[#003ea8]"
              onClick={() => connectMutation.mutate("/profile")}
              disabled={connectMutation.isPending}
            >
              <ExternalLinkIcon className="size-4" />
              {connectMutation.isPending ? "Connecting..." : "Connect"}
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-[#d8def0] bg-[#f8f9ff] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <AppIdentity
                icon={<CalendarIcon className="size-5" />}
                title="Google Calendar"
                description={`Connected${integration.connectedAt ? ` ${integration.connectedAt.toLocaleDateString()}` : ""}`}
              />
              <Button
                variant="outline"
                className="rounded-lg border-[#9aa3b8] bg-white text-[#0b1c30] hover:bg-[#eff4ff]"
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
              >
                {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
              </Button>
            </div>

            {integration.lastSyncError && (
              <p className="mt-3 rounded-lg border border-[#fecaca] bg-[#fff1f2] px-3 py-2 text-sm font-medium text-[#b91c1c]">
                Last sync error: {integration.lastSyncError}
              </p>
            )}

            <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-[#d8def0] bg-white p-3">
              <span className="flex items-center gap-3 text-sm font-bold text-[#0b1c30]">
                <CheckCircle2Icon className="size-5 text-[#004ac6]" />
                Enable automatic reminders
              </span>
              <input
                type="checkbox"
                className="size-5 accent-[#004ac6]"
                checked={integration.syncEnabled}
                disabled={setSyncMutation.isPending}
                onChange={(e) => setSyncMutation.mutate(e.target.checked)}
              />
            </label>
          </div>
        )}
      </div>
    </section>
  );
}

function AppIdentity({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex size-12 items-center justify-center rounded-lg bg-[#e5eeff] text-[#004ac6]">{icon}</div>
      <div>
        <p className="font-black text-[#0b1c30]">{title}</p>
        <p className="text-sm font-medium text-[#647086]">{description}</p>
      </div>
    </div>
  );
}
