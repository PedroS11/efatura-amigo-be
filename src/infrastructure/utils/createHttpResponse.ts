import type { APIGatewayProxyResult } from "aws-lambda";

export const createHttpResponse = (status: number, body: string): APIGatewayProxyResult => ({
  body,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET"
  },
  statusCode: status
});
