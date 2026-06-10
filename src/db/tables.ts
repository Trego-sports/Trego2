import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { geography } from "@/db/utils";
import type { SkillLevel, Sport } from "@/modules/sports/sports";

export type AttendanceStatus = "present" | "absent";
export type GameAnnouncementAudienceType = "all" | "selected";
export type NotificationType =
  | "game_joined"
  | "game_created"
  | "game_cancelled"
  | "game_announcement"
  | "attendance_mark_reminder"
  | "attendance_result_submitted"
  | "friend_request_received"
  | "friend_request_accepted";
export type NotificationMetadata = Record<string, string | number | boolean | null>;

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
    attendanceFinalizedAt: timestamp("attendance_finalized_at", { withTimezone: true }),
    attendanceFinalizedBy: text("attendance_finalized_by").references(() => usersTable.id, { onDelete: "set null" }),

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
    joinedViaInvite: boolean("joined_via_invite").notNull().default(false),
    invitedBy: text("invited_by").references(() => usersTable.id, { onDelete: "set null" }),
    invitedAt: timestamp("invited_at", { withTimezone: true }),
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

export const userCalendarIntegrationsTable = pgTable("user_calendar_integrations", {
  userId: text("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  refreshTokenEncrypted: text("refresh_token_encrypted").notNull(),
  calendarId: text("calendar_id").notNull().default("primary"),
  syncEnabled: boolean("sync_enabled").notNull().default(true),
  connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
  lastSyncError: text("last_sync_error"),
});

export const gameCalendarEventsTable = pgTable(
  "game_calendar_events",
  {
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    gameId: text("game_id")
      .notNull()
      .references(() => gamesTable.id, { onDelete: "cascade" }),
    googleEventId: text("google_event_id").notNull(),
    syncedAt: timestamp("synced_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.gameId] }),
    index("idx_game_calendar_events_game_id").on(table.gameId),
  ],
);

export const gameAnnouncementsTable = pgTable(
  "game_announcements",
  {
    id: text("id").primaryKey(),
    gameId: text("game_id")
      .notNull()
      .references(() => gamesTable.id, { onDelete: "cascade" }),
    senderUserId: text("sender_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    audienceType: text("audience_type").notNull().$type<GameAnnouncementAudienceType>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_game_announcements_game_id").on(table.gameId),
    check("game_announcements_audience_type_check", sql`${table.audienceType} IN ('all', 'selected')`),
  ],
);

export const gameAnnouncementRecipientsTable = pgTable(
  "game_announcement_recipients",
  {
    announcementId: text("announcement_id")
      .notNull()
      .references(() => gameAnnouncementsTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.announcementId, table.userId] }),
    index("idx_game_announcement_recipients_user_id").on(table.userId),
  ],
);

export const notificationsTable = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    recipientUserId: text("recipient_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    actorUserId: text("actor_user_id").references(() => usersTable.id, { onDelete: "set null" }),
    gameId: text("game_id").references(() => gamesTable.id, { onDelete: "set null" }),
    type: text("type").notNull().$type<NotificationType>(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    metadata: jsonb("metadata").$type<NotificationMetadata>(),
    readAt: timestamp("read_at", { withTimezone: true }),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_notifications_recipient_unread").on(table.recipientUserId, table.readAt, table.deletedAt),
    index("idx_notifications_recipient_recent").on(table.recipientUserId, table.deletedAt, table.createdAt),
    index("idx_notifications_game_id").on(table.gameId),
  ],
);
