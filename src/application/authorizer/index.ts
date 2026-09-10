import type { APIGatewayRequestAuthorizerEvent, APIGatewaySimpleAuthorizerWithContextResult } from "aws-lambda";
import * as cookie from "cookie";
import type { VerifiedGoogleUser } from "../../infrastructure/auth/types";
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
        context: { sub: "", name: undefined, email: undefined }
      };
    }

    const cookies = cookie.parseCookie(cookieHeader);
    const sessionId = cookies[COOKIE_SESSON_KEY];

    if (!sessionId) {
      return {
        isAuthorized: false,
        context: { sub: "", name: undefined, email: undefined }
      };
    }

    // Check DYNAMO

    /**
     * const session = await getSession(sessionId);
     *
     *   if (!session) {
     *     return {
     *       isAuthorized: false,
     *     };
     *   }
     *
     *   if (session.expiresAt <= Math.floor(Date.now() / 1000)) {
     *     return {
     *       isAuthorized: false,
     *     };
     *   }
     */

    return {
      isAuthorized: true,
      context: {
        email: "",
        name: "",
        sub: ""
      }
    };
  } catch (error) {
    logError("Authorization failed", {
      error: (error as Error).message
    });

    return {
      isAuthorized: false,
      context: { sub: "", name: undefined, email: undefined }
    };
  }
};
