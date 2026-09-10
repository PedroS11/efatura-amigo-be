export const COOKIE_SESSON_KEY = "__Host-session";

const SEVEN_DAYS_IN_SECONDS = 604800;

export const generateCookie = (sessionId: string, maxAge: number = SEVEN_DAYS_IN_SECONDS): string =>
  `${COOKIE_SESSON_KEY}=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;

export const generateDeleteCookie = (): string =>
  `${COOKIE_SESSON_KEY}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
