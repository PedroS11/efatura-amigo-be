import * as cookie from "cookie";
export const COOKIE_SESSON_KEY = "__Host-session";

export const SEVEN_DAYS_IN_SECONDS = 604800;

export const generateCookie = (sessionId: string): string =>
  cookie.stringifySetCookie({
    name: COOKIE_SESSON_KEY,
    value: sessionId,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS_IN_SECONDS
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
