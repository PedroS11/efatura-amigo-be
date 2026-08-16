import type { APIGatewayRequestAuthorizerEventV2, APIGatewaySimpleAuthorizerResult } from "aws-lambda";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { getEnvironmentVariable } from "../../infrastructure/utils/getEnvironmentVariable";
import { logError } from "../../infrastructure/utils/logger";

const GOOGLE_ISSUER = "https://accounts.google.com";
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export const handler = async (event: APIGatewayRequestAuthorizerEventV2): Promise<APIGatewaySimpleAuthorizerResult> => {
  try {
    const token = event.identitySource?.[0];

    if (!token) {
      return {
        isAuthorized: false
      };
    }

    const { payload } = await jwtVerify(token.replace(/^Bearer\s+/i, ""), GOOGLE_JWKS, {
      issuer: [GOOGLE_ISSUER, "https://accounts.google.com"],
      audience: getEnvironmentVariable("GOOGLE_OAUTH_CLIENT_ID")
    });

    if (payload.sub !== getEnvironmentVariable("GOOGLE_OAUTH_SUB")) {
      return {
        isAuthorized: false
      };
    }

    return {
      isAuthorized: true
    };
  } catch (error) {
    logError("Authorization failed", {
      error: (error as Error).message
    });

    return {
      isAuthorized: false
    };
  }
};
