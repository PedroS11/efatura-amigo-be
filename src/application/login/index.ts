import { randomBytes } from "node:crypto";
import type { APIGatewayEvent, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import {
  ForbiddenError,
  UnauthorizedError,
  verifyGoogleBearerToken
} from "../../infrastructure/auth/verifyGoogleBearerToken";
import { generateCookie } from "../../infrastructure/utils/cookies";
import { createHttpResponse } from "../../infrastructure/utils/createHttpResponse";
import { logError } from "../../infrastructure/utils/logger";

interface LoginPayload {
  credential: string;
}

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    const body: LoginPayload = JSON.parse(event.body ?? "");

    if (!body?.credential) {
      return createHttpResponse(400, "Invalid body");
    }

    const response = await verifyGoogleBearerToken(body.credential);

    const sessionId = randomBytes(32).toString("hex");

    // Save in Dynamo

    const cookie = generateCookie(sessionId);

    return createHttpResponse(200, response, undefined, [cookie]);
  } catch (error) {
    logError("Error login in", error);

    if (error instanceof UnauthorizedError) {
      return createHttpResponse(401, { message: "Unauthorized" });
    } else if (error instanceof ForbiddenError) {
      return createHttpResponse(403, { message: "Forbidden" });
    }

    throw error;
  }
};
