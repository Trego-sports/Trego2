import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const label = status === "present" ? "Present" : status === "absent" ? "Absent" : "No info";
  const className =
    status === "present"
      ? "border-green-700/30 bg-green-700/10 text-green-800"
      : status === "absent"
        ? "border-red-700/30 bg-red-700/10 text-red-800"
        : "border-muted-foreground/30 bg-muted text-muted-foreground";

  return (
    <span className={`inline-flex min-w-20 justify-center border px-2.5 py-1 text-xs font-medium ${className}`}>
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

  if (!isHost) {
    return null;
  }

  if (!hasGameEnded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
          <CardDescription>Attendance can be marked after the game ends.</CardDescription>
        </CardHeader>
      </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>{isFinalized ? "Attendance Results" : "Attendance"}</CardTitle>
        <CardDescription>
          {isFinalized
            ? "Attendance has been submitted and can no longer be changed."
            : "Mark who attended this completed game."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {participants.length > 0 ? (
          <>
            <div className="space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex flex-col gap-3 border-b pb-3 last:border-0 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                      {participant.profilePictureUrl ? (
                        <img
                          src={participant.profilePictureUrl}
                          alt={participant.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{participant.name}</div>
                      {participant.isHost && <div className="text-xs text-muted-foreground">Host</div>}
                    </div>
                  </div>

                  {isFinalized ? (
                    <AttendanceStatusBadge status={attendanceByUserId[participant.userId] ?? "unmarked"} />
                  ) : (
                    <Select
                      value={attendanceByUserId[participant.userId] ?? "unmarked"}
                      onValueChange={(value) =>
                        setAttendanceByUserId((current) => ({
                          ...current,
                          [participant.userId]: value as AttendanceFormStatus,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unmarked">Unmarked</SelectItem>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>

            {!isFinalized && (
              <>
                <Button type="button" onClick={() => setConfirmOpen(true)} disabled={markAttendance.isPending}>
                  {markAttendance.isPending ? "Submitting..." : "Save & Submit Attendance"}
                </Button>

                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit attendance?</DialogTitle>
                      <DialogDescription>
                        Once attendance is submitted, it cannot be changed. Please review each player carefully before
                        confirming.
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
              </>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No players to mark yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
