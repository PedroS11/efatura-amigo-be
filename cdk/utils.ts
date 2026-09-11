import { RemovalPolicy, type Stack } from "aws-cdk-lib";
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import type { Function } from "aws-cdk-lib/aws-lambda";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { getEnvironmentVariable } from "../src/infrastructure/utils/getEnvironmentVariable";

export { getAllowedOrigins } from "../src/infrastructure/utils/allowedOrigins";

export const isMain = (): boolean => !process.env.DEPLOY_ENV;

export const getStackName = (): string => getEnvironmentVariable("STACK_NAME");
export const getBranchName = (): string => getEnvironmentVariable("DEPLOY_ENV");

export const createLogGroup = (stack: Stack, id: string, lambda: Function): LogGroup =>
  new LogGroup(stack, `${id}LogGroup`, {
    retention: RetentionDays.THREE_DAYS,
    logGroupName: `/aws/lambda/${lambda.functionName}`,
    removalPolicy: RemovalPolicy.DESTROY
  });
