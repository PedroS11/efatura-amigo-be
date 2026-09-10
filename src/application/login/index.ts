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
import { logError, logMessage } from "../../infrastructure/utils/logger";

interface LoginPayload {
  credential: string;
}

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    const body: LoginPayload = JSON.parse(event.body ?? "");

    if (!body?.credential) {
      return createHttpResponse(400, "Invalid body");
    }

    logMessage("Login", body);

    const response = await verifyGoogleBearerToken(body.credential);

    logMessage("Login response", response);

    const sessionId = randomBytes(32).toString("hex");
    logMessage("sessionId", sessionId);

    await saveSession({
      sub: response.sub,
      name: response.name,
      email: response.email,
      expiresAt: Date.now() + SEVEN_DAYS_IN_SECONDS * 1000,
      id: sessionId
    });

    logMessage("Session saved");

    const cookie = generateCookie(sessionId);

    console.log("COOKIE:", cookie);
    console.log("HEADERS", event.headers);
    console.log(
      "RESPONSE:",
      createHttpResponse(
        200,
        response,
        {
          "Access-Control-Allow-Origin": event.headers?.origin ?? ""
        },
        [cookie]
      )
    );

    return createHttpResponse(
      200,
      response,
      {
        "Access-Control-Allow-Origin": event.headers?.origin ?? ""
      },
      [cookie]
    );
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
