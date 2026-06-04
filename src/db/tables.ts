import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgTable, primaryKey, text, timestamp, unique } from "drizzle-orm/pg-core";
import { geography } from "@/db/utils";
import type { SkillLevel, Sport } from "@/modules/sports/sports";

export type AttendanceStatus = "present" | "absent";

export const usersTable = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    location: geography("location"),
    profilePictureUrl: text("profile_picture_url"),
  },
  (table) => [index("idx_users_location").using("gist", table.location)],
);

export const oauthAccountsTable = pgTable(
  "oauth_accounts",
  {
    providerId: text("provider_id").notNull(),
    providerAccountId: text("provider_account_id").notNull(),

    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.providerId, table.providerAccountId] })],
);

export const playerSportsTable = pgTable(
  "player_sports",
  {
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    sport: text("sport").notNull().$type<Sport>(),
    skillLevel: text("skill_level").notNull().$type<SkillLevel>(),
    position: text("position"),
  },
  (table) => [unique().on(table.userId, table.sport)],
);

export const gamesTable = pgTable(
  "games",
  {
    id: text("id").primaryKey(),
    sport: text("sport").notNull().$type<Sport>(),
    title: text("title").notNull(),

    // Location
    locationName: text("location_name").notNull(),
    location: geography("location").notNull(),

    // Scheduling
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(90),

    // Game details
    allowedSkillLevels: text("allowed_skill_levels").array().notNull().$type<SkillLevel[]>(),
    spotsTotal: integer("spots_total").notNull(),
    requiresAttendanceScore: boolean("requires_attendance_score").notNull().default(false),
    minimumAttendanceScore: integer("minimum_attendance_score"),
    allowPlayersWithoutAttendanceHistory: boolean("allow_players_without_attendance_history").notNull().default(true),

    // Host
    hostId: text("host_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("idx_games_sport").on(table.sport),
    index("idx_games_scheduled_at").on(table.scheduledAt),
    index("idx_games_host_id").on(table.hostId),
    index("idx_games_location").using("gist", table.location),
    check(
      "games_minimum_attendance_score_check",
      sql`${table.minimumAttendanceScore} IS NULL OR (${table.minimumAttendanceScore} >= 0 AND ${table.minimumAttendanceScore} <= 100)`,
    ),
  ],
);

export const gameParticipantsTable = pgTable(
  "game_participants",
  {
    gameId: text("game_id")
      .notNull()
      .references(() => gamesTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    attendanceStatus: text("attendance_status").$type<AttendanceStatus>(),
    attendanceMarkedAt: timestamp("attendance_marked_at", { withTimezone: true }),
    attendanceMarkedBy: text("attendance_marked_by").references(() => usersTable.id, { onDelete: "set null" }),
  },
  (table) => [
    primaryKey({ columns: [table.gameId, table.userId] }),
    index("idx_game_participants_game_id").on(table.gameId),
    index("idx_game_participants_user_id").on(table.userId),
    check(
      "game_participants_attendance_status_check",
      sql`${table.attendanceStatus} IS NULL OR ${table.attendanceStatus} IN ('present', 'absent')`,
    ),
  ],
);
