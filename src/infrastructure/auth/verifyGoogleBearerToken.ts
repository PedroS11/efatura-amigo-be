import { createRemoteJWKSet, jwtVerify } from "jose";

import { getEnvironmentVariable } from "../utils/getEnvironmentVariable";
import type { VerifiedGoogleUser } from "./types";

const GOOGLE_ISSUER = "https://accounts.google.com";
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export const getAuthorizationHeader = (headers: Record<string, string | undefined> | undefined): string | undefined =>
  headers?.authorization ?? headers?.Authorization;

export const verifyGoogleBearerToken = async (authorizationHeader: string | undefined): Promise<VerifiedGoogleUser> => {
  if (!authorizationHeader) {
    throw new UnauthorizedError();
  }

  const token = authorizationHeader.replace(/^Bearer\s+/i, "");

  const { payload } = await jwtVerify(token, GOOGLE_JWKS, {
    issuer: [GOOGLE_ISSUER, "https://accounts.google.com"],
    audience: getEnvironmentVariable("GOOGLE_OAUTH_CLIENT_ID")
  });

  if (payload.sub !== getEnvironmentVariable("GOOGLE_OAUTH_SUB")) {
    throw new UnauthorizedError();
  }

  return {
    sub: payload.sub,
    email: typeof payload.email === "string" ? payload.email : undefined,
    name: typeof payload.name === "string" ? payload.name : undefined
  };
};
