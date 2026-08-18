import type { Stack } from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import { Architecture, Code, Function as LambdaFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export const createGetCategoryLambda = (stack: Stack): LambdaFunction =>
  new LambdaFunction(stack, "GetCategory", {
    runtime: Runtime.NODEJS_24_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/getCategory"),
    memorySize: 128,
    logRetention: RetentionDays.THREE_DAYS,
    architecture: Architecture.ARM_64
  });

export const createProcessNifsLambda = (stack: Stack): LambdaFunction =>
  new LambdaFunction(stack, "ProcessNifs", {
    runtime: Runtime.NODEJS_24_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/processNifs"),
    memorySize: 256,
    logRetention: RetentionDays.THREE_DAYS,
    architecture: Architecture.ARM_64,
    timeout: Duration.minutes(1),
    reservedConcurrentExecutions: 1,
    environment: {
      NIF_PT_API_KEY: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/NifPtApiKey"),
      TELEGRAM_CHAT_ID: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/TelegramChatId"),
      TELEGRAM_BOT_TOKEN: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/TelegramBotToken"),
      ALGOLIA_APPLICATION_ID: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/AlgoliaApplicationId"),
      ALGOLIA_WRITE_API_KEY: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/AlgoliaWriteApiKey"),
      ALGOLIA_COMPANIES_INDEX: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/AlgoliaCompaniesIndex")
    }
  });

export const createResyncLambda = (stack: Stack): LambdaFunction =>
  new LambdaFunction(stack, "Resync", {
    runtime: Runtime.NODEJS_24_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/resync"),
    memorySize: 256,
    timeout: Duration.minutes(5),
    logRetention: RetentionDays.THREE_DAYS,
    architecture: Architecture.ARM_64,
    environment: {
      ALGOLIA_APPLICATION_ID: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/AlgoliaApplicationId"),
      ALGOLIA_WRITE_API_KEY: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/AlgoliaWriteApiKey"),
      ALGOLIA_COMPANIES_INDEX: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/AlgoliaCompaniesIndex")
    }
  });

export const createSearchCompaniesLambda = (stack: Stack): LambdaFunction =>
  new LambdaFunction(stack, "SearchCompanies", {
    runtime: Runtime.NODEJS_24_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/searchCompanies"),
    memorySize: 256,
    logRetention: RetentionDays.THREE_DAYS,
    architecture: Architecture.ARM_64,
    timeout: Duration.seconds(30),
    environment: {
      ALGOLIA_APPLICATION_ID: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/AlgoliaApplicationId"),
      ALGOLIA_WRITE_API_KEY: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/AlgoliaWriteApiKey"),
      ALGOLIA_COMPANIES_INDEX: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/AlgoliaCompaniesIndex")
    }
  });

export const createGetCompanyLambda = (stack: Stack): LambdaFunction =>
  new LambdaFunction(stack, "GetCompany", {
    runtime: Runtime.NODEJS_24_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/getCompany"),
    memorySize: 128,
    logRetention: RetentionDays.THREE_DAYS,
    architecture: Architecture.ARM_64
  });

export const createAuthorizerLambda = (stack: Stack): LambdaFunction =>
  new LambdaFunction(stack, "Authorizer", {
    runtime: Runtime.NODEJS_24_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/authorizer"),
    memorySize: 256,
    logRetention: RetentionDays.THREE_DAYS,
    architecture: Architecture.ARM_64,
    timeout: Duration.seconds(30),
    environment: {
      GOOGLE_OAUTH_SUB: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/GoogleOAuthSub"),
      GOOGLE_OAUTH_CLIENT_ID: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/GoogleOAuthClientId")
    }
  });

export const createGetMetadataLambda = (stack: Stack): LambdaFunction =>
  new LambdaFunction(stack, "GetMetadata", {
    runtime: Runtime.NODEJS_24_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/getMetadata"),
    memorySize: 128,
    logRetention: RetentionDays.THREE_DAYS,
    architecture: Architecture.ARM_64,
    environment: {
      NIF_PT_API_KEY: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/NifPtApiKey")
    }
  });
