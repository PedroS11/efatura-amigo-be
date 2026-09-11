import { createRemoteJWKSet, errors, jwtVerify } from "jose";

import { getEnvironmentVariable } from "../utils/getEnvironmentVariable";
import { logError } from "../utils/logger";
import type { VerifiedGoogleUser } from "./types";

const GOOGLE_ISSUER = "https://accounts.google.com";
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "Forbidden";
  }
}

export const getAuthorizationHeader = (headers: Record<string, string | undefined> | undefined): string | undefined =>
  headers?.authorization ?? headers?.Authorization;

export const verifyGoogleBearerToken = async (bearerToken: string | undefined): Promise<VerifiedGoogleUser> => {
  if (!bearerToken) {
    throw new UnauthorizedError();
  }

  const token = bearerToken.replace(/^Bearer\s+/i, "");

  try {
    const { payload } = await jwtVerify(token, GOOGLE_JWKS, {
      issuer: [GOOGLE_ISSUER, "https://accounts.google.com"],
      audience: getEnvironmentVariable("GOOGLE_OAUTH_CLIENT_ID")
    });

    if (payload.sub !== getEnvironmentVariable("GOOGLE_OAUTH_SUB")) {
      throw new ForbiddenError();
    }

    return {
      sub: payload.sub,
      email: typeof payload.email === "string" ? payload.email : undefined,
      name: typeof payload.name === "string" ? payload.name : undefined
    };
  } catch (error) {
    logError("Error verifying Google bearer token", error);

    if (error instanceof errors.JOSEError) {
      throw new UnauthorizedError();
    }

    throw error;
  }
};
