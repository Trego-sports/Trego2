import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { disconnectCalendar } from "./sync";

export const $disconnectCalendar = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .handler(async ({ context }) => {
    await disconnectCalendar(context.db, context.userId);
  });
