import { env } from "cloudflare:workers";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { sign, unsign } from "./crypto";

const SESSION_COOKIE_NAME = "session";

export const $createSession = createServerOnlyFn(async (userId: string) => {
  const signed = await sign(userId, env.SESSION_SECRET);
  setCookie(SESSION_COOKIE_NAME, signed, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
});

export const $getUserId = createServerFn({ method: "GET" }).handler(async () => {
  const sessionCookie = getCookie(SESSION_COOKIE_NAME);
  return sessionCookie ? unsign(sessionCookie, env.SESSION_SECRET) : null;
});

export const $clearSession = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(SESSION_COOKIE_NAME, { path: "/" });
});
