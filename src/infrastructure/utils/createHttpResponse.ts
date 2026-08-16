import type { APIGatewayProxyResult } from "aws-lambda";

export const createHttpResponse = (status: number, body: string | object): APIGatewayProxyResult => ({
  body: typeof body === "string" ? body : JSON.stringify(body),
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET"
  },
  statusCode: status
});
