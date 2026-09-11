import type { APIGatewayRequestAuthorizerEvent, APIGatewaySimpleAuthorizerWithContextResult } from "aws-lambda";
import * as cookie from "cookie";
import type { VerifiedGoogleUser } from "../../infrastructure/googleAuth/types";
import { getSessionById } from "../../infrastructure/sessionsTable";
import { COOKIE_SESSON_KEY } from "../../infrastructure/utils/cookies";
import { logError } from "../../infrastructure/utils/logger";

export const handler = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewaySimpleAuthorizerWithContextResult<VerifiedGoogleUser | undefined>> => {
  try {
    const cookieHeader = event.headers?.cookie;

    if (!cookieHeader) {
      return {
        isAuthorized: false,
        context: undefined
      };
    }

    const cookies = cookie.parseCookie(cookieHeader);
    const sessionId = cookies[COOKIE_SESSON_KEY];

    if (!sessionId) {
      return {
        isAuthorized: false,
        context: undefined
      };
    }

    const session = await getSessionById(sessionId);

    if (!session) {
      return {
        isAuthorized: false,
        context: undefined
      };
    }

    if (session.expiresAt <= Date.now()) {
      return {
        isAuthorized: false,
        context: undefined
      };
    }

    return {
      isAuthorized: true,
      context: {
        email: session.email,
        name: session.name,
        sub: session.sub
      }
    };
  } catch (error) {
    logError("Authorization failed", {
      error: (error as Error).message
    });

    return {
      isAuthorized: false,
      context: undefined
    };
  }
};
