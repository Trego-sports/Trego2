import { createServerFn } from "@tanstack/react-start";
import { count } from "drizzle-orm";
import { gamesTable, usersTable } from "@/db/tables";
import { dbMiddleware } from "@/lib/middleware/db";

export const $getPlatformStats = createServerFn({ method: "GET" })
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    const [[players], [games]] = await Promise.all([
      context.db.select({ count: count() }).from(usersTable),
      context.db.select({ count: count() }).from(gamesTable),
    ]);

    return {
      playerCount: players?.count ?? 0,
      gameCount: games?.count ?? 0,
    };
  });
