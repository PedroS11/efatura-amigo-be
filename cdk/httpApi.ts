import type { Stack } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import {
  ApiMapping,
  type CfnStage,
  CorsHttpMethod,
  DomainName,
  HttpApi,
  HttpMethod
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Certificate, CertificateValidation } from "aws-cdk-lib/aws-certificatemanager";
import type { Function as LambdaFunction } from "aws-cdk-lib/aws-lambda";
import { LogGroup } from "aws-cdk-lib/aws-logs";

export const createHttpApi = (stack: Stack, getCategoryLambda: LambdaFunction) => {
  const apiAccessLogs = new LogGroup(stack, "ApiAccessLogs", {
    removalPolicy: cdk.RemovalPolicy.DESTROY
  });

  // To avoid creating a lambda just for log retention that used node 20 (soon to stop being supported)
  const cfnLogGroup = apiAccessLogs.node.defaultChild as cdk.aws_logs.CfnLogGroup;
  cfnLogGroup.retentionInDays = 3;

  const certificate = new Certificate(stack, "ApiCertificate", {
    domainName: "efatura.pedroosilva.dev",
    validation: CertificateValidation.fromDns()
  });

  const domainName = new DomainName(stack, "CustomDomain", {
    domainName: "efatura.pedroosilva.dev",
    certificate
  });

  const httpApi = new HttpApi(stack, "EfaturaAmigoApi", {
    apiName: "EfaturaAmigoApi",
    createDefaultStage: true,
    corsPreflight: {
      allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.OPTIONS],
      allowOrigins: ["*"],
      allowHeaders: ["Content-Type"]
    }
  });

  new ApiMapping(stack, "ApiMapping", {
    api: httpApi,
    domainName,
    stage: httpApi.defaultStage!
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

  httpApi.addRoutes({
    path: "/category/{nif}",
    methods: [HttpMethod.GET],
    integration: new HttpLambdaIntegration("LambdaIntegration", getCategoryLambda)
  });

  new cdk.CfnOutput(stack, "ApiUrl", {
    value: httpApi.url!
  });
};
