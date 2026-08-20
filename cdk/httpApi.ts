import type { Stack } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { type CfnStage, CorsHttpMethod, HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import type { Function as LambdaFunction } from "aws-cdk-lib/aws-lambda";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { getBranchName, isMain } from "./utils";

export const createHttpApi = (
  stack: Stack,
  getCategoryLambda: LambdaFunction,
  searchCompaniesLambda: LambdaFunction,
  getCompanyLambda: LambdaFunction,
  authorizerLambda: LambdaFunction,
  getMetadataLambda: LambdaFunction,
  getMeLambda: LambdaFunction
) => {
  const apiAccessLogs = new LogGroup(stack, "ApiAccessLogs", {
    removalPolicy: cdk.RemovalPolicy.DESTROY
  });

  // To avoid creating a lambda just for log retention that used node 20 (soon to stop being supported)
  const cfnLogGroup = apiAccessLogs.node.defaultChild as cdk.aws_logs.CfnLogGroup;
  cfnLogGroup.retentionInDays = 3;

  const httpApi = new HttpApi(stack, "EfaturaAmigoApi", {
    apiName: `EfaturaAmigoApi${!isMain() ? `--${getBranchName()}` : ""}`,
    createDefaultStage: true,
    corsPreflight: {
      allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.OPTIONS],
      allowOrigins: ["https://efatura.pedroosilva.dev"],
      allowHeaders: ["Content-Type", "Authorization"]
    }
  });

  // We check if defaultStage exists (it does, because we set true above)
  if (httpApi.defaultStage?.node?.defaultChild) {
    const cfnStage = httpApi.defaultStage.node.defaultChild as CfnStage;

    cfnStage.accessLogSettings = {
      destinationArn: apiAccessLogs.logGroupArn,
      format: JSON.stringify({
        requestId: "$context.requestId",
        ip: "$context.identity.sourceIp",
        requestTime: "$context.requestTime",
        httpMethod: "$context.httpMethod",
        routeKey: "$context.routeKey",
        status: "$context.status"
      })
    };
  }

  // Legacy, to be deleted
  httpApi.addRoutes({
    path: "/category/{nif}",
    methods: [HttpMethod.GET],
    integration: new HttpLambdaIntegration("LambdaIntegration", getCategoryLambda)
  });

  httpApi.addRoutes({
    path: "/api/category/{nif}",
    methods: [HttpMethod.GET],
    integration: new HttpLambdaIntegration("LambdaIntegration", getCategoryLambda)
  });

  /**
   * Private API
   */

  const googleAuthorizer = new HttpLambdaAuthorizer("GoogleLambdaAuthorizer", authorizerLambda, {
    authorizerName: "GoogleLambdaAuthorizer",
    identitySource: ["$request.header.Authorization"],
    responseTypes: [HttpLambdaResponseType.SIMPLE]
  });

  httpApi.addRoutes({
    path: "/api/search",
    methods: [HttpMethod.GET],
    integration: new HttpLambdaIntegration("SearchCompaniesIntegration", searchCompaniesLambda),
    authorizer: googleAuthorizer
  });

  httpApi.addRoutes({
    path: "/api/company/{nif}",
    methods: [HttpMethod.GET],
    integration: new HttpLambdaIntegration("SetCompanyIntegration", getCompanyLambda),
    authorizer: googleAuthorizer
  });

  httpApi.addRoutes({
    path: "/api/metadata",
    methods: [HttpMethod.GET],
    integration: new HttpLambdaIntegration("GetMetadataIntegration", getMetadataLambda),
    authorizer: googleAuthorizer
  });

  httpApi.addRoutes({
    path: "/api/me",
    methods: [HttpMethod.GET],
    integration: new HttpLambdaIntegration("GetMeIntegration", getMeLambda)
  });

  new cdk.CfnOutput(stack, "ApiUrl", {
    value: httpApi.url!
  });
};
