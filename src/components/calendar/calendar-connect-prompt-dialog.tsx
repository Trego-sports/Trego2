import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CALENDAR_PROMPT_DISMISSED_KEY, CALENDAR_PROMPT_SESSION_KEY } from "@/modules/calendar/constants";
import { useConnectGoogleCalendar } from "@/modules/calendar/mutations";
import { calendarQueries } from "@/modules/calendar/queries";

export function CalendarConnectPromptDialog({ returnPath = "/dashboard" }: { returnPath?: string }) {
  const [open, setOpen] = useState(false);
  const { data: status } = useSuspenseQuery(calendarQueries.getStatus());
  const connectMutation = useConnectGoogleCalendar();

  useEffect(() => {
    if (status.connected) return;
    if (localStorage.getItem(CALENDAR_PROMPT_DISMISSED_KEY) === "true") return;
    if (sessionStorage.getItem(CALENDAR_PROMPT_SESSION_KEY) !== "1") return;

    sessionStorage.removeItem(CALENDAR_PROMPT_SESSION_KEY);
    setOpen(true);
  }, [status.connected]);

  const dismiss = () => {
    localStorage.setItem(CALENDAR_PROMPT_DISMISSED_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Connect Google Calendar?
          </DialogTitle>
          <DialogDescription>
            Get automatic reminders 1 hour before your games. You can change this anytime in your profile.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={dismiss}>
            Skip for now
          </Button>
          <Button onClick={() => connectMutation.mutate(returnPath)} disabled={connectMutation.isPending}>
            Connect Google Calendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
