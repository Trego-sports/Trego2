import { createFileRoute, redirect } from "@tanstack/react-router";
import { $handleGoogleCalendarCallback } from "@/lib/auth/google-calendar";
import { dbMiddleware } from "@/lib/middleware/db";
import { $getUserId } from "@/lib/session";
import { backfillUpcomingGames, saveCalendarIntegration } from "@/modules/calendar/sync";

export const Route = createFileRoute("/api/callbacks/google-calendar")({
  server: {
    middleware: [dbMiddleware],
    handlers: {
      GET: async ({ context }) => {
        const result = await $handleGoogleCalendarCallback();
        if (result instanceof Response) {
          return result;
        }

        const userId = await $getUserId();
        if (!userId) {
          return new Response("Must be signed in to connect Google Calendar", { status: 401 });
        }

        await saveCalendarIntegration(context.db, userId, result.refreshToken);
        await backfillUpcomingGames(context.db, userId);

        const returnPath = result.returnPath?.startsWith("/") ? result.returnPath : "/profile";
        if (returnPath === "/dashboard") {
          return redirect({ to: "/dashboard" });
        }
        return redirect({ to: "/profile" });
      },
    },
  },
});
