import { env } from "cloudflare:workers";
import { Google } from "arctic";
import type { GoogleCalendarEventBody } from "./types";

export async function getCalendarAccessToken(refreshToken: string, redirectUri: string): Promise<string> {
  const google = new Google(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectUri);
  const tokens = await google.refreshAccessToken(refreshToken);
  return tokens.accessToken();
}

export async function insertCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: GoogleCalendarEventBody,
): Promise<string> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Calendar insert failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { id: string };
  return data.id;
}

export async function patchCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  event: GoogleCalendarEventBody,
): Promise<void> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Calendar patch failed (${response.status}): ${body}`);
  }
}

export async function deleteCalendarEvent(accessToken: string, calendarId: string, eventId: string): Promise<void> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (response.status === 404 || response.status === 410) {
    return;
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Calendar delete failed (${response.status}): ${body}`);
  }
}
