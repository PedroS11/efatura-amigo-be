import { getAllowedOrigins } from "../../../../../cdk/utils";

export const expectedHttpHeaders = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
  "Access-Control-Allow-Origin": getAllowedOrigins().join(","),
  "Content-Type": "application/json"
};
