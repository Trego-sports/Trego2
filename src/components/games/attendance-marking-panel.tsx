import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { AlertTriangleIcon, CheckIcon, LockIcon, MailIcon, SearchIcon, UsersIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AttendanceStatus } from "@/db/tables";
import { useMarkAttendance } from "@/modules/games/mutations";
import { gameQueries } from "@/modules/games/queries";

type AttendanceFormStatus = AttendanceStatus | "unmarked";

interface AttendanceMarkingPanelProps {
  gameId: string;
}

function getGameEndTime(scheduledAt: Date, durationMinutes: number) {
  return new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000);
}

function AttendanceStatusBadge({ status }: { status: AttendanceFormStatus }) {
  const label = status === "present" ? "Present" : status === "absent" ? "Absent" : "Pending";
  const className =
    status === "present"
      ? "bg-[#dcfce7] text-[#166534]"
      : status === "absent"
        ? "bg-[#fee2e2] text-[#991b1b]"
        : "bg-[#fef3c7] text-[#92400e]";

  return (
    <span className={`inline-flex min-w-20 justify-center rounded-full px-3 py-1 text-xs font-black ${className}`}>
      {label}
    </span>
  );
}

export function AttendanceMarkingPanel({ gameId }: AttendanceMarkingPanelProps) {
  const { userId } = useRouteContext({ from: "/_authed" });
  const { data: game } = useSuspenseQuery(gameQueries.getGame(gameId));
  const { data: participants } = useSuspenseQuery(gameQueries.getGameParticipants(gameId));
  const markAttendance = useMarkAttendance();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [attendanceByUserId, setAttendanceByUserId] = useState<Record<string, AttendanceFormStatus>>(() =>
    Object.fromEntries(
      participants.map((participant) => [participant.userId, participant.attendanceStatus ?? "unmarked"]),
    ),
  );

  useEffect(() => {
    setAttendanceByUserId(
      Object.fromEntries(
        participants.map((participant) => [participant.userId, participant.attendanceStatus ?? "unmarked"]),
      ),
    );
  }, [participants]);

  const isHost = game.hostId === userId;
  const gameEndTime = getGameEndTime(game.scheduledAt, game.durationMinutes);
  const hasGameEnded = gameEndTime <= new Date();
  const isFinalized = game.attendanceFinalizedAt !== null;
  const presentCount = participants.filter(
    (participant) => attendanceByUserId[participant.userId] === "present",
  ).length;
  const absentCount = participants.filter((participant) => attendanceByUserId[participant.userId] === "absent").length;
  const unmarkedCount = participants.filter(
    (participant) => (attendanceByUserId[participant.userId] ?? "unmarked") === "unmarked",
  ).length;
  const hasChanges = participants.some(
    (participant) =>
      (attendanceByUserId[participant.userId] ?? "unmarked") !== (participant.attendanceStatus ?? "unmarked"),
  );

  if (!isHost) {
    return (
      <section className="rounded-lg border border-[#c3c6d7] bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
        <h2 className="text-2xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
          Attendance is host-only
        </h2>
        <p className="mt-2 text-sm font-medium text-[#647086]">Only the game host can mark attendance.</p>
      </section>
    );
  }

  if (!hasGameEnded) {
    return (
      <section className="rounded-lg border border-[#c3c6d7] bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
        <h2 className="text-2xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
          Attendance opens after the game
        </h2>
        <p className="mt-2 text-sm font-medium text-[#647086]">You can mark attendance after the scheduled end time.</p>
      </section>
    );
  }

  const handleSubmit = async () => {
    await markAttendance.mutateAsync({
      gameId,
      attendance: participants.map((participant) => ({
        userId: participant.userId,
        status:
          attendanceByUserId[participant.userId] === "unmarked"
            ? null
            : (attendanceByUserId[participant.userId] as AttendanceStatus),
      })),
    });
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      {hasChanges && !isFinalized && (
        <div className="flex flex-col gap-3 rounded-lg border border-[#fde68a] bg-[#fff7d6] p-4 text-[#7a4d00] shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangleIcon className="size-5 shrink-0" />
            <p className="font-bold">You have unsaved attendance changes.</p>
          </div>
          <button type="button" onClick={() => setConfirmOpen(true)} className="text-sm font-black underline">
            Save Now
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <main className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard label="Total Expected" value={participants.length} />
            <SummaryCard label="Present" value={presentCount} accent="green" />
            <SummaryCard label="Absent" value={absentCount} />
          </div>

          <section className="overflow-hidden rounded-lg border border-[#c3c6d7] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-3 border-b border-[#d8def0] bg-[#f8f9ff] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
                  Roster
                </h2>
                <p className="mt-1 text-sm font-medium text-[#647086]">
                  {unmarkedCount > 0 ? `${unmarkedCount} players still pending` : "Every player has a status"}
                </p>
              </div>
              <div className="flex h-11 items-center gap-2 rounded-lg border border-[#c3c6d7] bg-white px-3 text-[#647086] sm:w-64">
                <SearchIcon className="size-4" />
                <span className="text-sm font-medium">Search player...</span>
              </div>
            </div>

            {participants.length > 0 ? (
              <div className="divide-y divide-[#e5e7ef]">
                {participants.map((participant) => {
                  const status = attendanceByUserId[participant.userId] ?? "unmarked";

                  return (
                    <div
                      key={participant.userId}
                      className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#e5eeff] text-sm font-black text-[#004ac6]">
                          {participant.profilePictureUrl ? (
                            <img
                              src={participant.profilePictureUrl}
                              alt={participant.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            initials(participant.name)
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-lg font-black text-[#0b1c30]">{participant.name}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-[#647086]">
                            <span>{participant.isHost ? "Host" : "Player"}</span>
                            <span aria-hidden="true">•</span>
                            <AttendanceStatusBadge status={status} />
                          </div>
                        </div>
                      </div>

                      {isFinalized ? (
                        <AttendanceStatusBadge status={status} />
                      ) : (
                        <div className="grid grid-cols-3 gap-2 md:flex md:justify-end">
                          <StatusButton
                            status="present"
                            selected={status === "present"}
                            onClick={() =>
                              setAttendanceByUserId((current) => ({ ...current, [participant.userId]: "present" }))
                            }
                          />
                          <StatusButton
                            status="absent"
                            selected={status === "absent"}
                            onClick={() =>
                              setAttendanceByUserId((current) => ({ ...current, [participant.userId]: "absent" }))
                            }
                          />
                          <StatusButton
                            status="unmarked"
                            selected={status === "unmarked"}
                            onClick={() =>
                              setAttendanceByUserId((current) => ({ ...current, [participant.userId]: "unmarked" }))
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <UsersIcon className="mx-auto size-10 text-[#c3c6d7]" />
                <p className="mt-3 font-black text-[#0b1c30]">No players to mark yet</p>
                <p className="mt-1 text-sm font-medium text-[#647086]">Attendance will appear once players join.</p>
              </div>
            )}
          </section>
        </main>

        <aside className="space-y-6">
          <section className="rounded-lg border border-[#c3c6d7] bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            <h2 className="text-2xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
              Finalize Attendance
            </h2>
            <p className="mt-4 text-base font-medium leading-7 text-[#38485d]">
              Lock in attendance for this event. This updates player reliability and cannot be changed after submit.
            </p>
            <div className="mt-6 grid gap-3">
              <Button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={markAttendance.isPending || isFinalized || participants.length === 0}
                className="h-12 rounded-lg bg-[#004ac6] text-base font-black text-white hover:bg-[#003ea8]"
              >
                <CheckIcon className="size-5" />
                {markAttendance.isPending ? "Saving..." : isFinalized ? "Attendance Locked" : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled
                className="h-12 rounded-lg border-[#9aa3b8] bg-white text-base font-black text-[#0b1c30]"
              >
                <LockIcon className="size-5" />
                Lock Register
              </Button>
            </div>
          </section>

          <section className="rounded-lg border border-[#c3c6d7] bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            <h2 className="text-2xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
              Communication
            </h2>
            <p className="mt-3 text-sm font-medium text-[#38485d]">Send a message to attendees or absentees.</p>
            <div className="mt-5 grid gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-lg border-[#004ac6] bg-white font-black text-[#004ac6]"
              >
                <MailIcon className="size-5" />
                Message Absentees
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-lg border-[#9aa3b8] bg-white font-black text-[#38485d]"
              >
                <UsersIcon className="size-5" />
                Message All
              </Button>
            </div>
          </section>
        </aside>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit attendance?</DialogTitle>
            <DialogDescription>
              Once attendance is submitted, it cannot be changed. Please review each player carefully before confirming.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Recheck</DialogClose>
            <Button type="button" onClick={handleSubmit} disabled={markAttendance.isPending}>
              {markAttendance.isPending ? "Submitting..." : "Confirm Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent?: "green" }) {
  return (
    <div
      className={`rounded-lg border border-[#c3c6d7] bg-white p-5 text-center shadow-[0_2px_10px_rgba(15,23,42,0.04)] ${
        accent === "green" ? "border-b-4 border-b-[#16a34a]" : ""
      }`}
    >
      <p className="text-sm font-black uppercase tracking-[0.1em] text-[#38485d]">{label}</p>
      <p className="mt-2 text-3xl font-black text-[#0b1c30] tabular-nums">{value}</p>
    </div>
  );
}

function StatusButton({
  status,
  selected,
  onClick,
}: {
  status: AttendanceFormStatus;
  selected: boolean;
  onClick: () => void;
}) {
  const config = {
    present: {
      label: "Present",
      icon: CheckIcon,
      selectedClass: "border-[#16a34a] bg-[#16a34a] text-white",
    },
    absent: {
      label: "Absent",
      icon: XIcon,
      selectedClass: "border-[#b91c1c] bg-[#b91c1c] text-white",
    },
    unmarked: {
      label: "Pending",
      icon: AlertTriangleIcon,
      selectedClass: "border-[#f59e0b] bg-[#fef3c7] text-[#92400e]",
    },
  }[status];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-black transition active:scale-[0.96] ${
        selected ? config.selectedClass : "border-[#c3c6d7] bg-white text-[#38485d] hover:bg-[#eff4ff]"
      }`}
    >
      <Icon className="size-4" />
      <span className="hidden sm:inline">{config.label}</span>
    </button>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
