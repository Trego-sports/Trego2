import { index, integer, pgTable, primaryKey, text, timestamp, unique } from "drizzle-orm/pg-core";
import { geography } from "@/db/utils";
import type { SkillLevel, Sport } from "@/modules/sports/sports";

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
  },
  (table) => [
    primaryKey({ columns: [table.gameId, table.userId] }),
    index("idx_game_participants_game_id").on(table.gameId),
    index("idx_game_participants_user_id").on(table.userId),
  ],
);
