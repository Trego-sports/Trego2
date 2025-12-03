import { createFileRoute, redirect } from "@tanstack/react-router";
import { oauthAccountsTable, usersTable } from "@/db/tables";
import { $handleGoogleCallback, GOOGLE_PROVIDER_ID } from "@/lib/auth/google";
import { generateId } from "@/lib/id";
import { dbMiddleware } from "@/lib/middleware/db";
import { $createSession } from "@/lib/session";

export const Route = createFileRoute("/api/callbacks/google")({
  server: {
    middleware: [dbMiddleware],
    handlers: {
      GET: async ({ context }) => {
        const claims = await $handleGoogleCallback();
        // If the claims is a Response (error case), return it directly
        if (claims instanceof Response) {
          return claims;
        }

        if (!claims.email_verified) {
          return new Response("Must have a verified email", { status: 401 });
        }

        const existingAccount = await context.db.query.oauthAccountsTable.findFirst({
          columns: { userId: true },
          where: (table, { and, eq }) => {
            return and(eq(table.providerId, GOOGLE_PROVIDER_ID), eq(table.providerAccountId, claims.sub));
          },
        });

        if (existingAccount) {
          await $createSession(existingAccount.userId);
          return redirect({ to: "/dashboard" });
        }

        const userId = generateId("user");

        await context.db.insert(usersTable).values({
          id: userId,
          name: claims.name,
          email: claims.email,
          profilePictureUrl: claims.picture,
        });

        await context.db
          .insert(oauthAccountsTable)
          .values({ providerId: GOOGLE_PROVIDER_ID, providerAccountId: claims.sub, userId });

        await $createSession(userId);
        return redirect({ to: "/dashboard" });
      },
    },
  },
});
