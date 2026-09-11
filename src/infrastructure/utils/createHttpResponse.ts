import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { getAllowedOrigins } from "./allowedOrigins";

export const createHttpResponse = (
  status: number,
  body: string | object,
  origin: string = "",
  headers?: APIGatewayProxyStructuredResultV2["headers"],
  cookies?: APIGatewayProxyStructuredResultV2["cookies"]
): APIGatewayProxyStructuredResultV2 => ({
  body: typeof body === "string" ? body : JSON.stringify(body),
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type",
    ...(getAllowedOrigins().includes(origin) && { "Access-Control-Allow-Origin": origin }),
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
    "Access-Control-Allow-Credentials": "true",
    ...headers
  },
  cookies,
  statusCode: status
});
