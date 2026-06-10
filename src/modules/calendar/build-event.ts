import type { CalendarGameData, GoogleCalendarEventBody } from "./types";

export function buildGoogleCalendarEvent(
  game: CalendarGameData,
  userId: string,
  appOrigin: string,
): GoogleCalendarEventBody {
  const endTime = new Date(game.scheduledAt.getTime() + game.durationMinutes * 60 * 1000);
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${game.location.lat},${game.location.lon}`;
  const gameUrl = `${appOrigin}/games/${game.id}/manage`;

  return {
    summary: `[Trego] ${game.sport} — ${game.title}`,
    location: `${game.locationName} (${mapsLink})`,
    description: [
      `${game.sport} game on Trego`,
      `Location: ${game.locationName}`,
      `Skill levels: ${game.allowedSkillLevels.join(", ")}`,
      `View game: ${gameUrl}`,
    ].join("\n"),
    start: {
      dateTime: game.scheduledAt.toISOString(),
      timeZone: "UTC",
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: "UTC",
    },
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: 60 }],
    },
    extendedProperties: {
      private: {
        tregoGameId: game.id,
        tregoUserId: userId,
      },
    },
  };
}
