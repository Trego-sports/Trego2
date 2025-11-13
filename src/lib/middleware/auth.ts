import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { $getUserId } from "@/lib/session";

export const authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const userId = await $getUserId();
  if (!userId) {
    throw redirect({ to: "/login" });
  }

  return next({ context: { userId } });
});
