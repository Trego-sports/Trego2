import { z } from "zod";

export const sportsSchema = z.enum([
  "Basketball",
  "Soccer",
  "Tennis",
  "Volleyball",
  "Pickleball",
  "Football",
  "Baseball",
  "Softball",
  "Ultimate Frisbee",
  "Other",
]);
export type Sport = z.infer<typeof sportsSchema>;

export const skillLevelSchema = z.enum(["Beginner", "Intermediate", "Advanced"]);
export type SkillLevel = z.infer<typeof skillLevelSchema>;
