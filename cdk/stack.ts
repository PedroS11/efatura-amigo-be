import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import type { CfnStage } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { AttributeType, Billing, TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { Queue } from "aws-cdk-lib/aws-sqs";
import type { Construct } from "constructs";

export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const processNifDLQ = new Queue(this, "ProcessNifDLQ", {
      retentionPeriod: cdk.Duration.days(1),
      fifo: true
    });
    // TODO: FIFO to prevent duplicates + 2mins delay
    const processNifSQS = new Queue(this, "ProcessNifSQS", {
      deadLetterQueue: {
        queue: processNifDLQ,
        maxReceiveCount: 2
      },
      fifo: true,
      retentionPeriod: cdk.Duration.days(1)
    });

    const table = new TableV2(this, "NifCategoryTable", {
      partitionKey: {
        type: AttributeType.NUMBER,
        name: "nif"
      },
      billing: Billing.onDemand()
    });

    const getCategoryLambda = new Function(this, "GetCategory", {
      runtime: Runtime.NODEJS_22_X,
      handler: "index.handler",
      code: Code.fromAsset("dist/getCategory"),
      memorySize: 128,
      logRetention: RetentionDays.THREE_DAYS
    });

    table.grantReadData(getCategoryLambda);
    getCategoryLambda.addEnvironment("NIF_CATEGORY_TABLE_NAME", table.tableName);

    processNifSQS.grantSendMessages(getCategoryLambda);
    getCategoryLambda.addEnvironment("PROCESS_NIF_SQS", processNifSQS.queueName);

    const playwrightLayer = new LayerVersion(this, "PlaywrightLayer", {
      code: Code.fromAsset("layers/playwright"), // Github Action creates this folder
      compatibleRuntimes: [Runtime.NODEJS_22_X],
      description: "Layer containing playwright-core and sparticuz-chromium"
    });

    const processNifLambda = new Function(this, "ProcessNif", {
      runtime: Runtime.NODEJS_22_X,
      handler: "index.handler", // Note: handler is in index.mjs
      code: Code.fromAsset("dist/processNif"),
      memorySize: 1024,
      timeout: Duration.seconds(30),
      layers: [playwrightLayer],
      logRetention: RetentionDays.THREE_DAYS
    });

    table.grantWriteData(processNifLambda);
    processNifLambda.addEnvironment("NIF_CATEGORY_TABLE_NAME", table.tableName);

    processNifSQS.grantConsumeMessages(processNifLambda);
    processNifLambda.addEnvironment("PROCESS_NIF_SQS", processNifSQS.queueName);

    processNifLambda.addEventSource(
      new SqsEventSource(processNifSQS, {
        batchSize: 1
      })
    );

    const apiAccessLogs = new LogGroup(this, "ApiAccessLogs", {
      retention: RetentionDays.THREE_DAYS, // Aggressive cleanup to save Storage
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const httpApi = new HttpApi(this, "EfaturaAmigoApi", {
      apiName: "EfaturaAmigoApi",
      createDefaultStage: true
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

    new cdk.CfnOutput(this, "ApiUrl", {
      value: httpApi.url!
    });
  }
}
