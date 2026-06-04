import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { getUserAttendanceStats } from "./utils";

export const $getUserAttendanceStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ context, data }) => {
    return await getUserAttendanceStats(context.db, data.userId);
  });
