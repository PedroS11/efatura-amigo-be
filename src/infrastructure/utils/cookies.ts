import * as cookie from "cookie";
export const COOKIE_SESSON_KEY = "__Host-session";

export const SEVEN_DAYS_IN_SECONDS = 604800;

export const generateCookie = (sessionId: string, maxAge: number = SEVEN_DAYS_IN_SECONDS): string =>
  cookie.stringifySetCookie({
    name: COOKIE_SESSON_KEY,
    value: sessionId,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge
  });

export const generateDeleteCookie = (): string =>
  cookie.stringifySetCookie({
    name: COOKIE_SESSON_KEY,
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
