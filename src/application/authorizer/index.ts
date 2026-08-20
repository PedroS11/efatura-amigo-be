import type { APIGatewayRequestAuthorizerEventV2, APIGatewaySimpleAuthorizerResult } from "aws-lambda";

import { UnauthorizedError, verifyGoogleBearerToken } from "../../infrastructure/auth/verifyGoogleBearerToken";
import { logError } from "../../infrastructure/utils/logger";

export const handler = async (event: APIGatewayRequestAuthorizerEventV2): Promise<APIGatewaySimpleAuthorizerResult> => {
  try {
    await verifyGoogleBearerToken(event.identitySource?.[0]);

    return {
      isAuthorized: true
    };
  } catch (error) {
    if (!(error instanceof UnauthorizedError)) {
      logError("Authorization failed", {
        error: (error as Error).message
      });
    }

    return {
      isAuthorized: false
    };
  }
};
