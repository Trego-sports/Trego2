import type { SkillLevel, Sport } from "@/modules/sports/sports";

export interface DashboardGame {
  id: string;
  sport: Sport;
  title: string;
  locationName: string;
  location: { lat: number; lon: number };
  scheduledAt: Date;
  durationMinutes: number;
  spotsTotal: number;
  spotsFilled: number;
  skillLevels: SkillLevel[];
  hostId: string;
  hostName: string;
  isHost: boolean;
  distance?: number; // in kilometers
}
