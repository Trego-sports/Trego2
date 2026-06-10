export type UserAttendanceStats = {
  userId: string;
  presentCount: number;
  absentCount: number;
  markedCount: number;
  attendanceScore: number | null;
  hasAttendanceHistory: boolean;
};
