import { randomBytes } from "node:crypto";
import type { APIGatewayEvent, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import {
  ForbiddenError,
  UnauthorizedError,
  verifyGoogleBearerToken
} from "../../infrastructure/googleAuth/verifyGoogleBearerToken";
import { saveSession } from "../../infrastructure/sessionsTable";
import { generateCookie, SEVEN_DAYS_IN_SECONDS } from "../../infrastructure/utils/cookies";
import { createHttpResponse } from "../../infrastructure/utils/createHttpResponse";
import { logError } from "../../infrastructure/utils/logger";

interface LoginPayload {
  credential: string;
}

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    const body: LoginPayload = JSON.parse(event.body ?? "");

    if (!body?.credential) {
      return createHttpResponse(
        400,
        {
          message: "Invalid body"
        },
        event.headers?.origin
      );
    }

    const response = await verifyGoogleBearerToken(body.credential);

    const sessionId = randomBytes(32).toString("hex");

    await saveSession({
      sub: response.sub,
      name: response.name,
      email: response.email,
      expiresAt: Date.now() + SEVEN_DAYS_IN_SECONDS * 1000,
      id: sessionId
    });

    const cookie = generateCookie(sessionId);

    return createHttpResponse(200, response, event.headers?.origin, undefined, [cookie]);
  } catch (error) {
    logError("Error login in", error);

    if (error instanceof UnauthorizedError) {
      return createHttpResponse(401, { message: "Unauthorized" }, event.headers?.origin);
    } else if (error instanceof ForbiddenError) {
      return createHttpResponse(403, { message: "Forbidden" }, event.headers?.origin);
    }

    throw error;
  }
};
