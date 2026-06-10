import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { gameParticipantsTable, gamesTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { createNotifications } from "@/modules/notifications";

const attendanceStatusSchema = z.enum(["present", "absent"]).nullable();

export const markAttendanceSchema = z.object({
  gameId: z.string(),
  attendance: z
    .array(
      z.object({
        userId: z.string(),
        status: attendanceStatusSchema,
      }),
    )
    .min(1, "Select at least one participant"),
});
export type MarkAttendanceInput = z.input<typeof markAttendanceSchema>;

export const $markAttendance = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(markAttendanceSchema)
  .handler(async ({ context, data }) => {
    const submittedUserIds = [...new Set(data.attendance.map((record) => record.userId))];
    if (submittedUserIds.length !== data.attendance.length) {
      throw new Error("Each participant can only be marked once.");
    }

    await context.db.transaction(async (tx) => {
      const [game] = await tx
        .select({
          id: gamesTable.id,
          hostId: gamesTable.hostId,
          sport: gamesTable.sport,
          title: gamesTable.title,
          locationName: gamesTable.locationName,
          scheduledAt: gamesTable.scheduledAt,
          durationMinutes: gamesTable.durationMinutes,
          attendanceFinalizedAt: gamesTable.attendanceFinalizedAt,
        })
        .from(gamesTable)
        .where(eq(gamesTable.id, data.gameId))
        .limit(1);

      if (!game) {
        throw new Error("Game not found");
      }

      if (game.hostId !== context.userId) {
        throw new Error("Only the game host can mark attendance.");
      }

      if (game.attendanceFinalizedAt) {
        throw new Error("Attendance has already been submitted for this game.");
      }

      const gameEndsAt = new Date(game.scheduledAt.getTime() + game.durationMinutes * 60 * 1000);
      if (gameEndsAt > new Date()) {
        throw new Error("Attendance can only be marked after the game has ended.");
      }

      const participants = await tx
        .select({ userId: gameParticipantsTable.userId })
        .from(gameParticipantsTable)
        .where(
          and(eq(gameParticipantsTable.gameId, data.gameId), inArray(gameParticipantsTable.userId, submittedUserIds)),
        );

      if (participants.length !== submittedUserIds.length) {
        throw new Error("Attendance can only be marked for game participants.");
      }

      const markedAt = new Date();

      for (const record of data.attendance) {
        await tx
          .update(gameParticipantsTable)
          .set(
            record.status === null
              ? {
                  attendanceStatus: null,
                  attendanceMarkedAt: null,
                  attendanceMarkedBy: null,
                }
              : {
                  attendanceStatus: record.status,
                  attendanceMarkedAt: markedAt,
                  attendanceMarkedBy: context.userId,
                },
          )
          .where(and(eq(gameParticipantsTable.gameId, data.gameId), eq(gameParticipantsTable.userId, record.userId)));
      }

      await tx
        .update(gamesTable)
        .set({
          attendanceFinalizedAt: markedAt,
          attendanceFinalizedBy: context.userId,
        })
        .where(eq(gamesTable.id, data.gameId));

      await createNotifications(
        tx,
        data.attendance.map((record) => ({
          recipientUserId: record.userId,
          actorUserId: context.userId,
          gameId: data.gameId,
          type: "attendance_result_submitted",
          title: "Attendance submitted",
          body:
            record.status === null
              ? `The host submitted attendance for "${game.title}". No attendance status was recorded for you.`
              : `The host submitted attendance for "${game.title}".`,
          metadata: {
            gameTitle: game.title,
            sport: game.sport,
            locationName: game.locationName,
            scheduledAt: game.scheduledAt.toISOString(),
            attendanceStatus: record.status,
          },
        })),
      );
    });
  });
