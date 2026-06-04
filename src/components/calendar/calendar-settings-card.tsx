import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Calendar reminders
        </CardTitle>
        <CardDescription>
          Automatically add Trego games to Google Calendar with a 1-hour reminder before start.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Google Calendar is not connected.</p>
            <Button onClick={() => connectMutation.mutate("/profile")} disabled={connectMutation.isPending}>
              Connect Google Calendar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connected
              {integration.connectedAt ? ` on ${integration.connectedAt.toLocaleDateString()}` : ""}.
            </p>

            {integration.lastSyncError && (
              <p className="text-sm text-destructive">Last sync error: {integration.lastSyncError}</p>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="size-4"
                checked={integration.syncEnabled}
                disabled={setSyncMutation.isPending}
                onChange={(e) => setSyncMutation.mutate(e.target.checked)}
              />
              <span className="text-sm">Enable automatic reminders</span>
            </label>

            <Button
              variant="outline"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
            >
              Disconnect Google Calendar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
