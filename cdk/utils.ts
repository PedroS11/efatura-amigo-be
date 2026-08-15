import { getEnvironmentVariable } from "../src/infrastructure/utils/getEnvironmentVariable";

export const isMain = (): boolean => !process.env.DEPLOY_ENV;

export const getStackName = (): string => getEnvironmentVariable("STACK_NAME");
