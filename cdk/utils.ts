import type { Stack } from "aws-cdk-lib";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { getEnvironmentVariable } from "../src/infrastructure/utils/getEnvironmentVariable";

export const isMain = (): boolean => !process.env.DEPLOY_ENV;

export const getStackName = (): string => getEnvironmentVariable("STACK_NAME");
export const getBranchName = (): string => getEnvironmentVariable("DEPLOY_ENV");

export const getAllowedOrigins = (): string[] => ["https://efatura.pedroosilva.dev", "http://localhost:5173"];

export const createLogGroup = (stack: Stack, lambdaName: string): LogGroup =>
  new LogGroup(stack, `${lambdaName}LogGroup`, {
    retention: RetentionDays.THREE_DAYS
  });
