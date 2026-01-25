import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import { HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { AttributeType, Billing, TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Queue } from "aws-cdk-lib/aws-sqs";
import type { Construct } from "constructs";

export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const processNifDLQ = new Queue(this, "ProcessNifDLQ", {
      retentionPeriod: cdk.Duration.days(1)
    });
    const processNifSQS = new Queue(this, "ProcessNifSQS", {
      deadLetterQueue: {
        queue: processNifDLQ,
        maxReceiveCount: 2
      },
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
      code: Code.fromAsset("dist/getCategory", {
        bundling: undefined // disable any docker bundling
      }),
      memorySize: 128
    });

    table.grantReadData(getCategoryLambda);
    getCategoryLambda.addEnvironment("NIF_CATEGORY_TABLE_NAME", table.tableName);

    processNifSQS.grantSendMessages(getCategoryLambda);
    getCategoryLambda.addEnvironment("PROCESS_NIF_SQS", processNifSQS.queueName);

    // // Chromium layer - built by scripts/build-chromium-layer.mjs
    // const chromiumLayer = new LayerVersion(this, "ChromiumLayer", {
    //   code: Code.fromAsset("layers/chromium"),
    //   compatibleRuntimes: [Runtime.NODEJS_22_X],
    //   description: "Chromium binary for Lambda (@sparticuz/chromium)"
    // });

    const processNifLambda = new Function(this, "ProcessNif", {
      runtime: Runtime.NODEJS_22_X,
      handler: "index.handler",
      code: Code.fromAsset("dist/processNif", {
        bundling: undefined // disable any docker bundling
      }),
      memorySize: 1024, // Chromium needs more memory
      timeout: Duration.seconds(30) // Browser automation needs more time
      // layers: [chromiumLayer]
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

    const httpApi = new HttpApi(this, "EfaturaAmigoApi", {
      apiName: "EfaturaAmigoApi",
      createDefaultStage: true
    });

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
