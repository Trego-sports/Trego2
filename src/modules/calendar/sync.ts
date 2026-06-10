import { getRequestUrl } from "@tanstack/react-start/server";
import { and, eq, gt } from "drizzle-orm";
import { gameCalendarEventsTable, gameParticipantsTable, gamesTable, userCalendarIntegrationsTable } from "@/db/tables";
import { GOOGLE_CALENDAR_CALLBACK_PATH } from "@/lib/auth/google-calendar";
import type { DBContext } from "@/lib/middleware/db";
import { decryptToken, encryptToken, getCalendarTokenSecret } from "@/lib/token-encryption";
import { buildGoogleCalendarEvent } from "./build-event";
import {
  deleteCalendarEvent,
  getCalendarAccessToken,
  insertCalendarEvent,
  patchCalendarEvent,
} from "./google-calendar-client";
import type { CalendarGameData } from "./types";

function getAppOrigin(): string {
  try {
    return getRequestUrl().origin;
  } catch {
    return "https://trego.app";
  }
}

function getCalendarRedirectUri(): string {
  return new URL(GOOGLE_CALENDAR_CALLBACK_PATH, getAppOrigin()).toString().replace(/\/$/, "");
}

async function loadGameForCalendar(db: DBContext, gameId: string): Promise<CalendarGameData | null> {
  const rows = await db
    .select({
      id: gamesTable.id,
      sport: gamesTable.sport,
      title: gamesTable.title,
      locationName: gamesTable.locationName,
      location: gamesTable.location,
      scheduledAt: gamesTable.scheduledAt,
      durationMinutes: gamesTable.durationMinutes,
      allowedSkillLevels: gamesTable.allowedSkillLevels,
    })
    .from(gamesTable)
    .where(eq(gamesTable.id, gameId))
    .limit(1);

  const game = rows[0];
  if (!game) return null;
  if (game.scheduledAt <= new Date()) return null;

  return {
    id: game.id,
    sport: game.sport,
    title: game.title,
    locationName: game.locationName,
    location: game.location,
    scheduledAt: game.scheduledAt,
    durationMinutes: game.durationMinutes,
    allowedSkillLevels: game.allowedSkillLevels,
  };
}

async function setSyncError(db: DBContext, userId: string, message: string): Promise<void> {
  await db
    .update(userCalendarIntegrationsTable)
    .set({ lastSyncError: message })
    .where(eq(userCalendarIntegrationsTable.userId, userId));
}

async function clearSyncError(db: DBContext, userId: string): Promise<void> {
  await db
    .update(userCalendarIntegrationsTable)
    .set({ lastSyncError: null })
    .where(eq(userCalendarIntegrationsTable.userId, userId));
}

export async function upsertGameEvent(db: DBContext, userId: string, gameId: string): Promise<void> {
  try {
    const integration = await db.query.userCalendarIntegrationsTable.findFirst({
      where: eq(userCalendarIntegrationsTable.userId, userId),
    });

    if (!integration?.syncEnabled) return;

    const game = await loadGameForCalendar(db, gameId);
    if (!game) return;

    const refreshToken = await decryptToken(integration.refreshTokenEncrypted, getCalendarTokenSecret());
    if (!refreshToken) {
      await setSyncError(db, userId, "Failed to decrypt calendar credentials. Please reconnect.");
      return;
    }

    const accessToken = await getCalendarAccessToken(refreshToken, getCalendarRedirectUri());
    const eventBody = buildGoogleCalendarEvent(game, userId, getAppOrigin());

    const existing = await db.query.gameCalendarEventsTable.findFirst({
      where: and(eq(gameCalendarEventsTable.userId, userId), eq(gameCalendarEventsTable.gameId, gameId)),
    });

    if (existing) {
      await patchCalendarEvent(accessToken, integration.calendarId, existing.googleEventId, eventBody);
      await db
        .update(gameCalendarEventsTable)
        .set({ syncedAt: new Date() })
        .where(and(eq(gameCalendarEventsTable.userId, userId), eq(gameCalendarEventsTable.gameId, gameId)));
    } else {
      const googleEventId = await insertCalendarEvent(accessToken, integration.calendarId, eventBody);
      await db.insert(gameCalendarEventsTable).values({
        userId,
        gameId,
        googleEventId,
        syncedAt: new Date(),
      });
    }

    await clearSyncError(db, userId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Calendar sync failed";
    console.error(`Calendar upsert failed for user ${userId} game ${gameId}:`, message);
    await setSyncError(db, userId, message);
  }
}

export async function deleteGameEvent(db: DBContext, userId: string, gameId: string): Promise<void> {
  try {
    const integration = await db.query.userCalendarIntegrationsTable.findFirst({
      where: eq(userCalendarIntegrationsTable.userId, userId),
    });

    const existing = await db.query.gameCalendarEventsTable.findFirst({
      where: and(eq(gameCalendarEventsTable.userId, userId), eq(gameCalendarEventsTable.gameId, gameId)),
    });

    if (!existing) return;

    if (integration?.syncEnabled) {
      const refreshToken = await decryptToken(integration.refreshTokenEncrypted, getCalendarTokenSecret());
      if (refreshToken) {
        const accessToken = await getCalendarAccessToken(refreshToken, getCalendarRedirectUri());
        await deleteCalendarEvent(accessToken, integration.calendarId, existing.googleEventId);
      }
    }

    await db
      .delete(gameCalendarEventsTable)
      .where(and(eq(gameCalendarEventsTable.userId, userId), eq(gameCalendarEventsTable.gameId, gameId)));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Calendar delete failed";
    console.error(`Calendar delete failed for user ${userId} game ${gameId}:`, message);
    await setSyncError(db, userId, message);
  }
}

export async function syncGameForAllParticipants(db: DBContext, gameId: string): Promise<void> {
  const participants = await db
    .select({ userId: gameParticipantsTable.userId })
    .from(gameParticipantsTable)
    .where(eq(gameParticipantsTable.gameId, gameId));

  await Promise.all(participants.map((p) => upsertGameEvent(db, p.userId, gameId)));
}

export async function deleteAllGameCalendarEvents(db: DBContext, gameId: string): Promise<void> {
  const rows = await db
    .select({ userId: gameCalendarEventsTable.userId })
    .from(gameCalendarEventsTable)
    .where(eq(gameCalendarEventsTable.gameId, gameId));

  await Promise.all(rows.map((r) => deleteGameEvent(db, r.userId, gameId)));
}

export async function backfillUpcomingGames(db: DBContext, userId: string): Promise<void> {
  const now = new Date();
  const upcoming = await db
    .select({ gameId: gameParticipantsTable.gameId })
    .from(gameParticipantsTable)
    .innerJoin(gamesTable, eq(gameParticipantsTable.gameId, gamesTable.id))
    .where(and(eq(gameParticipantsTable.userId, userId), gt(gamesTable.scheduledAt, now)));

  for (const { gameId } of upcoming) {
    await upsertGameEvent(db, userId, gameId);
  }
}

export async function saveCalendarIntegration(db: DBContext, userId: string, refreshToken: string): Promise<void> {
  const encrypted = await encryptToken(refreshToken, getCalendarTokenSecret());

  await db
    .insert(userCalendarIntegrationsTable)
    .values({
      userId,
      refreshTokenEncrypted: encrypted,
      syncEnabled: true,
      connectedAt: new Date(),
      lastSyncError: null,
    })
    .onConflictDoUpdate({
      target: userCalendarIntegrationsTable.userId,
      set: {
        refreshTokenEncrypted: encrypted,
        syncEnabled: true,
        connectedAt: new Date(),
        lastSyncError: null,
      },
    });
}

export async function disconnectCalendar(db: DBContext, userId: string): Promise<void> {
  const events = await db
    .select({
      gameId: gameCalendarEventsTable.gameId,
      googleEventId: gameCalendarEventsTable.googleEventId,
    })
    .from(gameCalendarEventsTable)
    .where(eq(gameCalendarEventsTable.userId, userId));

  const integration = await db.query.userCalendarIntegrationsTable.findFirst({
    where: eq(userCalendarIntegrationsTable.userId, userId),
  });

  if (integration) {
    const refreshToken = await decryptToken(integration.refreshTokenEncrypted, getCalendarTokenSecret());
    if (refreshToken) {
      try {
        const accessToken = await getCalendarAccessToken(refreshToken, getCalendarRedirectUri());
        for (const event of events) {
          await deleteCalendarEvent(accessToken, integration.calendarId, event.googleEventId);
        }
      } catch {
        // Best-effort cleanup
      }
    }
  }

  await db.delete(gameCalendarEventsTable).where(eq(gameCalendarEventsTable.userId, userId));
  await db.delete(userCalendarIntegrationsTable).where(eq(userCalendarIntegrationsTable.userId, userId));
}
