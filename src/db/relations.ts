import { relations } from "drizzle-orm";
import {
  friendMessagesTable,
  friendRequestsTable,
  friendshipsTable,
  gameAnnouncementMessagesTable,
  gameAnnouncementRecipientsTable,
  gameAnnouncementsTable,
  gameCalendarEventsTable,
  gameParticipantsTable,
  gamesTable,
  notificationsTable,
  oauthAccountsTable,
  playerSportsTable,
  userCalendarIntegrationsTable,
  usersTable,
} from "./tables";

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  oauthAccounts: many(oauthAccountsTable),
  playerSports: many(playerSportsTable),
  hostedGames: many(gamesTable),
  gameParticipants: many(gameParticipantsTable, { relationName: "gameParticipantUser" }),
  markedAttendanceRecords: many(gameParticipantsTable, { relationName: "attendanceMarkedBy" }),
  invitedParticipantRecords: many(gameParticipantsTable, { relationName: "participantInvitedBy" }),
  calendarIntegration: one(userCalendarIntegrationsTable),
  calendarEvents: many(gameCalendarEventsTable),
  receivedNotifications: many(notificationsTable, { relationName: "notificationRecipient" }),
  actedNotifications: many(notificationsTable, { relationName: "notificationActor" }),
  sentFriendMessages: many(friendMessagesTable, { relationName: "friendMessageSender" }),
  sentFriendRequests: many(friendRequestsTable, { relationName: "friendRequestRequester" }),
  receivedFriendRequests: many(friendRequestsTable, { relationName: "friendRequestRecipient" }),
  friendshipsAsUserA: many(friendshipsTable, { relationName: "friendshipUserA" }),
  friendshipsAsUserB: many(friendshipsTable, { relationName: "friendshipUserB" }),
  requestedFriendships: many(friendshipsTable, { relationName: "friendshipRequestedBy" }),
  acceptedFriendships: many(friendshipsTable, { relationName: "friendshipAcceptedBy" }),
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

export const friendRequestsRelations = relations(friendRequestsTable, ({ one }) => ({
  requester: one(usersTable, {
    fields: [friendRequestsTable.requesterUserId],
    references: [usersTable.id],
    relationName: "friendRequestRequester",
  }),
  recipient: one(usersTable, {
    fields: [friendRequestsTable.recipientUserId],
    references: [usersTable.id],
    relationName: "friendRequestRecipient",
  }),
}));

export const friendshipsRelations = relations(friendshipsTable, ({ one, many }) => ({
  userA: one(usersTable, {
    fields: [friendshipsTable.userAId],
    references: [usersTable.id],
    relationName: "friendshipUserA",
  }),
  userB: one(usersTable, {
    fields: [friendshipsTable.userBId],
    references: [usersTable.id],
    relationName: "friendshipUserB",
  }),
  requestedBy: one(usersTable, {
    fields: [friendshipsTable.requestedByUserId],
    references: [usersTable.id],
    relationName: "friendshipRequestedBy",
  }),
  acceptedBy: one(usersTable, {
    fields: [friendshipsTable.acceptedByUserId],
    references: [usersTable.id],
    relationName: "friendshipAcceptedBy",
  }),
  messages: many(friendMessagesTable),
}));

export const friendMessagesRelations = relations(friendMessagesTable, ({ one }) => ({
  sender: one(usersTable, {
    fields: [friendMessagesTable.senderUserId],
    references: [usersTable.id],
    relationName: "friendMessageSender",
  }),
  friendship: one(friendshipsTable, {
    fields: [friendMessagesTable.userAId, friendMessagesTable.userBId],
    references: [friendshipsTable.userAId, friendshipsTable.userBId],
  }),
}));

export const gamesRelations = relations(gamesTable, ({ one, many }) => ({
  host: one(usersTable, {
    fields: [gamesTable.hostId],
    references: [usersTable.id],
  }),
  participants: many(gameParticipantsTable),
  announcements: many(gameAnnouncementsTable),
  notifications: many(notificationsTable),
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
  invitedBy: one(usersTable, {
    fields: [gameParticipantsTable.invitedBy],
    references: [usersTable.id],
    relationName: "participantInvitedBy",
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

export const gameAnnouncementsRelations = relations(gameAnnouncementsTable, ({ one, many }) => ({
  game: one(gamesTable, {
    fields: [gameAnnouncementsTable.gameId],
    references: [gamesTable.id],
  }),
  sender: one(usersTable, {
    fields: [gameAnnouncementsTable.senderUserId],
    references: [usersTable.id],
  }),
  recipients: many(gameAnnouncementRecipientsTable),
  messages: many(gameAnnouncementMessagesTable),
}));

export const gameAnnouncementRecipientsRelations = relations(gameAnnouncementRecipientsTable, ({ one }) => ({
  announcement: one(gameAnnouncementsTable, {
    fields: [gameAnnouncementRecipientsTable.announcementId],
    references: [gameAnnouncementsTable.id],
  }),
  user: one(usersTable, {
    fields: [gameAnnouncementRecipientsTable.userId],
    references: [usersTable.id],
  }),
}));

export const gameAnnouncementMessagesRelations = relations(gameAnnouncementMessagesTable, ({ one }) => ({
  announcement: one(gameAnnouncementsTable, {
    fields: [gameAnnouncementMessagesTable.announcementId],
    references: [gameAnnouncementsTable.id],
  }),
  sender: one(usersTable, {
    fields: [gameAnnouncementMessagesTable.senderUserId],
    references: [usersTable.id],
  }),
  threadParticipant: one(usersTable, {
    fields: [gameAnnouncementMessagesTable.threadParticipantUserId],
    references: [usersTable.id],
  }),
}));

export const notificationsRelations = relations(notificationsTable, ({ one }) => ({
  recipient: one(usersTable, {
    fields: [notificationsTable.recipientUserId],
    references: [usersTable.id],
    relationName: "notificationRecipient",
  }),
  actor: one(usersTable, {
    fields: [notificationsTable.actorUserId],
    references: [usersTable.id],
    relationName: "notificationActor",
  }),
  game: one(gamesTable, {
    fields: [notificationsTable.gameId],
    references: [gamesTable.id],
  }),
}));
