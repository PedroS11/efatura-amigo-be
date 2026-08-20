import type { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";

import {
  getAuthorizationHeader,
  UnauthorizedError,
  verifyGoogleBearerToken
} from "../../infrastructure/auth/verifyGoogleBearerToken";
import { createHttpResponse } from "../../infrastructure/utils/createHttpResponse";
import type { GetMeResponse } from "./types";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
  try {
    const user: GetMeResponse = await verifyGoogleBearerToken(getAuthorizationHeader(event.headers));

    return createHttpResponse(200, user);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return createHttpResponse(401, { message: "Unauthorized" });
    }

    throw error;
  }
};
