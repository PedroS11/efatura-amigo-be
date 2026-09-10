import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda";

import type { APIGatewayProxyEventV2WithContext } from "../../infrastructure/utils/aws/apiGateway/types";
import { createHttpResponse } from "../../infrastructure/utils/createHttpResponse";
import type { GetMeResponse } from "./types";

export const handler = async (event: APIGatewayProxyEventV2WithContext): Promise<APIGatewayProxyStructuredResultV2> => {
  const user: GetMeResponse = event.requestContext.authorizer.lambda;

  return createHttpResponse(200, user);
};
