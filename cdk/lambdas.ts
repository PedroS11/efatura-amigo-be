import type { Stack } from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import { Architecture, Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export const createGetCategoryLambda = (stack: Stack): Function =>
  new Function(stack, "GetCategory", {
    runtime: Runtime.NODEJS_22_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/getCategory"),
    memorySize: 128,
    logRetention: RetentionDays.THREE_DAYS,
    architecture: Architecture.ARM_64
  });

export const createProcessNifsLambda = (stack: Stack): Function =>
  new Function(stack, "ProcessNifs", {
    runtime: Runtime.NODEJS_22_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/processNifs"),
    memorySize: 128,
    logRetention: RetentionDays.THREE_DAYS,
    architecture: Architecture.ARM_64,
    timeout: Duration.minutes(1),
    reservedConcurrentExecutions: 1,
    environment: {
      NIF_PT_API_KEY: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/NifPtApiKey"),
      TELEGRAM_CHAT_ID: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/TelegramChatId"),
      TELEGRAM_BOT_TOKEN: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/TelegramBotToken")
    }
  });
