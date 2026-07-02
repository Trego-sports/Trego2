import { describe, expect, test } from "bun:test";
import { skillLevelSchema, sportsSchema } from "./sports";

describe("sports schemas", () => {
  test("accepts supported sports and skill levels", () => {
    expect(sportsSchema.parse("Basketball")).toBe("Basketball");
    expect(skillLevelSchema.parse("Intermediate")).toBe("Intermediate");
  });

  test("rejects unsupported values", () => {
    expect(sportsSchema.safeParse("Quidditch").success).toBe(false);
    expect(skillLevelSchema.safeParse("Professional").success).toBe(false);
  });
});
