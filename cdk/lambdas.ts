import { Duration, type Stack } from "aws-cdk-lib";
import { Architecture, Code, Function as LambdaFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { createLogGroup } from "./utils";

export const createGetCategoryLambda = (stack: Stack): LambdaFunction => {
  const lambda = new LambdaFunction(stack, "GetCategory", {
    runtime: Runtime.NODEJS_24_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/getCategory"),
    memorySize: 128,
    architecture: Architecture.ARM_64,
    timeout: Duration.seconds(10)
  });

  createLogGroup(stack, "GetCategory", lambda);

  return lambda;
};

export const createProcessNifsLambda = (stack: Stack): LambdaFunction => {
  const lambda = new LambdaFunction(stack, "ProcessNifs", {
    runtime: Runtime.NODEJS_24_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/processNifs"),
    memorySize: 256,
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

  createLogGroup(stack, "ProcessNifs", lambda);

  return lambda;
};

export const createResyncLambda = (stack: Stack): LambdaFunction => {
  const lambda = new LambdaFunction(stack, "Resync", {
    runtime: Runtime.NODEJS_24_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/resync"),
    memorySize: 256,
    timeout: Duration.minutes(5),
    architecture: Architecture.ARM_64,
    environment: {
      ALGOLIA_APPLICATION_ID: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/AlgoliaApplicationId"),
      ALGOLIA_WRITE_API_KEY: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/AlgoliaWriteApiKey"),
      ALGOLIA_COMPANIES_INDEX: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/AlgoliaCompaniesIndex")
    }
  });

  createLogGroup(stack, "Resync", lambda);

  return lambda;
};

export const createSearchCompaniesLambda = (stack: Stack): LambdaFunction => {
  const lambda = new LambdaFunction(stack, "SearchCompanies", {
    runtime: Runtime.NODEJS_24_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/searchCompanies"),
    memorySize: 256,
    architecture: Architecture.ARM_64,
    timeout: Duration.seconds(30),
    environment: {
      ALGOLIA_APPLICATION_ID: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/AlgoliaApplicationId"),
      ALGOLIA_WRITE_API_KEY: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/AlgoliaWriteApiKey"),
      ALGOLIA_COMPANIES_INDEX: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/AlgoliaCompaniesIndex")
    }
  });

  createLogGroup(stack, "SearchCompanies", lambda);

  return lambda;
};

export const createGetCompanyLambda = (stack: Stack): LambdaFunction => {
  const lambda = new LambdaFunction(stack, "GetCompany", {
    runtime: Runtime.NODEJS_24_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/getCompany"),
    memorySize: 128,
    architecture: Architecture.ARM_64,
    timeout: Duration.seconds(10)
  });

  createLogGroup(stack, "GetCompany", lambda);

  return lambda;
};

export const createAuthorizerLambda = (stack: Stack): LambdaFunction => {
  const lambda = new LambdaFunction(stack, "Authorizer", {
    runtime: Runtime.NODEJS_24_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/authorizer"),
    memorySize: 256,
    architecture: Architecture.ARM_64,
    timeout: Duration.seconds(30),
    environment: {
      GOOGLE_OAUTH_SUB: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/GoogleOAuthSub"),
      GOOGLE_OAUTH_CLIENT_ID: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/GoogleOAuthClientId")
    }
  });

  createLogGroup(stack, "Authorizer", lambda);

  return lambda;
};

export const createGetMetadataLambda = (stack: Stack): LambdaFunction => {
  const lambda = new LambdaFunction(stack, "GetMetadata", {
    runtime: Runtime.NODEJS_24_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/getMetadata"),
    memorySize: 128,
    architecture: Architecture.ARM_64,
    timeout: Duration.seconds(10),
    environment: {
      NIF_PT_API_KEY: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/NifPtApiKey")
    }
  });

  createLogGroup(stack, "GetMetadata", lambda);

  return lambda;
};

export const createGetMeLambda = (stack: Stack): LambdaFunction => {
  const lambda = new LambdaFunction(stack, "GetMe", {
    runtime: Runtime.NODEJS_24_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/getMe"),
    memorySize: 256,
    architecture: Architecture.ARM_64,
    timeout: Duration.seconds(10)
  });

  createLogGroup(stack, "GetMe", lambda);

  return lambda;
};

export const createLoginLambda = (stack: Stack): LambdaFunction => {
  const lambda = new LambdaFunction(stack, "Login", {
    runtime: Runtime.NODEJS_24_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/login"),
    timeout: Duration.seconds(30),
    memorySize: 512,
    architecture: Architecture.ARM_64,
    environment: {
      GOOGLE_OAUTH_SUB: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/GoogleOAuthSub"),
      GOOGLE_OAUTH_CLIENT_ID: StringParameter.valueForStringParameter(stack, "/EfaturaAmigoBe/GoogleOAuthClientId")
    }
  });

  createLogGroup(stack, "Login", lambda);

  return lambda;
};

export const createLogoutLambda = (stack: Stack): LambdaFunction => {
  const lambda = new LambdaFunction(stack, "Logout", {
    runtime: Runtime.NODEJS_24_X,
    handler: "index.handler",
    code: Code.fromAsset("dist/logout"),
    memorySize: 128,
    architecture: Architecture.ARM_64,
    timeout: Duration.seconds(10)
  });

  createLogGroup(stack, "Logout", lambda);

  return lambda;
};
