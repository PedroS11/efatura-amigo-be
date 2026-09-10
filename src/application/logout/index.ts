import type { APIGatewayEvent, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import * as cookie from "cookie";
import { COOKIE_SESSON_KEY, generateDeleteCookie } from "../../infrastructure/utils/cookies";
import { createHttpResponse } from "../../infrastructure/utils/createHttpResponse";
import { logError } from "../../infrastructure/utils/logger";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    const cookieHeader = event.headers?.cookie;

    if (!cookieHeader) {
      return createHttpResponse(200, "Ok");
    }

    const cookies = cookie.parseCookie(cookieHeader);
    const sessionId = cookies[COOKIE_SESSON_KEY];

    // Delete from dynamo

    const deleteCookie = generateDeleteCookie();

    return createHttpResponse(200, "Ok", undefined, [deleteCookie]);
  } catch (error) {
    logError("Error login out", error);

    throw error;
  }
};
