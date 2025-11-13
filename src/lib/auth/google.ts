import { env } from "cloudflare:workers";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getCookies, getRequestUrl, setCookie } from "@tanstack/react-start/server";
import { decodeIdToken, Google, generateCodeVerifier, generateState, type OAuth2Tokens } from "arctic";
import { z } from "zod";

const GOOGLE_SCOPES = ["email", "profile"];

export const GOOGLE_PROVIDER_ID = "google";
export const GOOGLE_CALLBACK_PATH = "/api/callbacks/google";
export const STATE_COOKIE_NAME = "google_state";
export const CODE_VERIFIER_COOKIE_NAME = "google_code_verifier";

export const googleClaimsSchema = z.object({
  sub: z.string(),
  email: z.string(),
  email_verified: z.boolean(),
  picture: z.string().optional(),
  name: z.string(),
});

export function getRedirectUri(requestUrl: URL): string {
  return new URL(GOOGLE_CALLBACK_PATH, requestUrl.origin).toString().replace(/\/$/, "");
}

export const $loginWithGoogle = createServerFn({ method: "POST" }).handler(async () => {
  const requestUrl = getRequestUrl();
  const absoluteUrl = getRedirectUri(requestUrl);

  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const google = new Google(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, absoluteUrl);
  const redirectUrl = google.createAuthorizationURL(state, codeVerifier, GOOGLE_SCOPES).toString();

  setCookie(STATE_COOKIE_NAME, state, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
  });

  setCookie(CODE_VERIFIER_COOKIE_NAME, codeVerifier, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
  });

  return { redirectUrl };
});

export const $handleGoogleCallback = createServerOnlyFn(async () => {
  const url = getRequestUrl();
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return new Response("Bad Request", { status: 400 });
  }

  const cookies = getCookies();
  const storedState = cookies[STATE_COOKIE_NAME];
  const storedCodeVerifier = cookies[CODE_VERIFIER_COOKIE_NAME];

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

  const idToken = tokens.idToken();
  const claims = decodeIdToken(idToken);
  return googleClaimsSchema.parse(claims);
});
