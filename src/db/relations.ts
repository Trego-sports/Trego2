import { relations } from "drizzle-orm";
import {
  gameCalendarEventsTable,
  gameParticipantsTable,
  gamesTable,
  oauthAccountsTable,
  playerSportsTable,
  userCalendarIntegrationsTable,
  usersTable,
} from "./tables";

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  oauthAccounts: many(oauthAccountsTable),
  playerSports: many(playerSportsTable),
  hostedGames: many(gamesTable),
  gameParticipants: many(gameParticipantsTable),
  calendarIntegration: one(userCalendarIntegrationsTable),
  calendarEvents: many(gameCalendarEventsTable),
}));

export const oauthAccountsRelations = relations(oauthAccountsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [oauthAccountsTable.userId],
    references: [usersTable.id],
  }),
}));

export const playerSportsRelations = relations(playerSportsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [playerSportsTable.userId],
    references: [usersTable.id],
  }),
}));

export const gamesRelations = relations(gamesTable, ({ one, many }) => ({
  host: one(usersTable, {
    fields: [gamesTable.hostId],
    references: [usersTable.id],
  }),
  participants: many(gameParticipantsTable),
}));

export const gameParticipantsRelations = relations(gameParticipantsTable, ({ one }) => ({
  game: one(gamesTable, {
    fields: [gameParticipantsTable.gameId],
    references: [gamesTable.id],
  }),
  user: one(usersTable, {
    fields: [gameParticipantsTable.userId],
    references: [usersTable.id],
  }),
}));

export const userCalendarIntegrationsRelations = relations(userCalendarIntegrationsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userCalendarIntegrationsTable.userId],
    references: [usersTable.id],
  }),
}));

export const gameCalendarEventsRelations = relations(gameCalendarEventsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [gameCalendarEventsTable.userId],
    references: [usersTable.id],
  }),
  game: one(gamesTable, {
    fields: [gameCalendarEventsTable.gameId],
    references: [gamesTable.id],
  }),
}));
