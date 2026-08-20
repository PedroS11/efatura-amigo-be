import { getAllowedOrigins } from "../../../../cdk/utils";

export const expectedHttpHeaders = {
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,GET",
  "Access-Control-Allow-Origin": getAllowedOrigins().join(","),
  "Content-Type": "application/json"
};
