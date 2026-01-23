import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  return {
    body: "",
    statusCode: 200
  };
};
