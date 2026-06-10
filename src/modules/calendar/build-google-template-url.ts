import type { CalendarGameData } from "./types";

export function buildGoogleCalendarTemplateUrl(game: CalendarGameData): string {
  const endTime = new Date(game.scheduledAt.getTime() + game.durationMinutes * 60 * 1000);

  const formatDate = (date: Date) => {
    return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
  };

  const startDate = formatDate(game.scheduledAt);
  const endDate = formatDate(endTime);

  const calendarUrl = new URL("https://calendar.google.com/calendar/render");
  calendarUrl.searchParams.set("action", "TEMPLATE");
  calendarUrl.searchParams.set("text", game.title);
  calendarUrl.searchParams.set("dates", `${startDate}/${endDate}`);
  calendarUrl.searchParams.set("details", `${game.sport} game at ${game.locationName}`);
  calendarUrl.searchParams.set("location", game.locationName);

  return calendarUrl.toString();
}
