import { relations } from "drizzle-orm";
import { gameParticipantsTable, gamesTable, oauthAccountsTable, playerSportsTable, usersTable } from "./tables";

export const usersRelations = relations(usersTable, ({ many }) => ({
  oauthAccounts: many(oauthAccountsTable),
  playerSports: many(playerSportsTable),
  hostedGames: many(gamesTable),
  gameParticipants: many(gameParticipantsTable, { relationName: "gameParticipantUser" }),
  markedAttendanceRecords: many(gameParticipantsTable, { relationName: "attendanceMarkedBy" }),
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
    relationName: "gameParticipantUser",
  }),
  attendanceMarkedBy: one(usersTable, {
    fields: [gameParticipantsTable.attendanceMarkedBy],
    references: [usersTable.id],
    relationName: "attendanceMarkedBy",
  }),
}));
