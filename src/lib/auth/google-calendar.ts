import { env } from "cloudflare:workers";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getCookies, getRequestUrl, setCookie } from "@tanstack/react-start/server";
import { Google, generateCodeVerifier, generateState, type OAuth2Tokens } from "arctic";
import { z } from "zod";
import { authMiddleware } from "@/lib/middleware/auth";

export const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";
export const GOOGLE_CALENDAR_CALLBACK_PATH = "/api/callbacks/google-calendar";
export const CALENDAR_STATE_COOKIE_NAME = "google_calendar_state";
export const CALENDAR_CODE_VERIFIER_COOKIE_NAME = "google_calendar_code_verifier";
export const CALENDAR_RETURN_PATH_COOKIE_NAME = "google_calendar_return_path";

export function getRedirectUri(requestUrl: URL): string {
  return new URL(GOOGLE_CALENDAR_CALLBACK_PATH, requestUrl.origin).toString().replace(/\/$/, "");
}

export const $connectGoogleCalendar = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(z.object({ returnPath: z.string().optional() }))
  .handler(async ({ data }) => {
    const requestUrl = getRequestUrl();
    const absoluteUrl = getRedirectUri(requestUrl);

    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const google = new Google(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, absoluteUrl);
    const url = google.createAuthorizationURL(state, codeVerifier, [GOOGLE_CALENDAR_SCOPE]);
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");

    setCookie(CALENDAR_STATE_COOKIE_NAME, state, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: import.meta.env.PROD,
    });

    setCookie(CALENDAR_CODE_VERIFIER_COOKIE_NAME, codeVerifier, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: import.meta.env.PROD,
    });

    if (data?.returnPath) {
      setCookie(CALENDAR_RETURN_PATH_COOKIE_NAME, data.returnPath, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: import.meta.env.PROD,
        maxAge: 60 * 10,
      });
    }

    return { redirectUrl: url.toString() };
  });

export const $handleGoogleCalendarCallback = createServerOnlyFn(async () => {
  const url = getRequestUrl();
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return new Response("Bad Request", { status: 400 });
  }

  const cookies = getCookies();
  const storedState = cookies[CALENDAR_STATE_COOKIE_NAME];
  const storedCodeVerifier = cookies[CALENDAR_CODE_VERIFIER_COOKIE_NAME];

  if (!storedState || !storedCodeVerifier) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (storedState !== state) {
    return new Response("Unauthorized", { status: 401 });
  }

  const requestUrl = getRequestUrl();
  const redirectUrl = getRedirectUri(requestUrl);
  const google = new Google(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectUrl);

  let tokens: OAuth2Tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
  } catch {
    return new Response("Unexpected error", { status: 500 });
  }

  if (!tokens.hasRefreshToken()) {
    return new Response(
      "No refresh token received. Please revoke Trego access in Google Account settings and try again.",
      {
        status: 400,
      },
    );
  }

  return { refreshToken: tokens.refreshToken(), returnPath: cookies[CALENDAR_RETURN_PATH_COOKIE_NAME] };
});
