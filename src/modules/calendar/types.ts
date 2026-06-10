import type { SkillLevel, Sport } from "@/modules/sports/sports";

export interface CalendarGameData {
  id: string;
  sport: Sport;
  title: string;
  locationName: string;
  location: { lat: number; lon: number };
  scheduledAt: Date;
  durationMinutes: number;
  allowedSkillLevels: SkillLevel[];
}

export interface GoogleCalendarEventBody {
  summary: string;
  location?: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  reminders: {
    useDefault: boolean;
    overrides: Array<{ method: "popup" | "email"; minutes: number }>;
  };
  extendedProperties?: {
    private?: Record<string, string>;
  };
}
