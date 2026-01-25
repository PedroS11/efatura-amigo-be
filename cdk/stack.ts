import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import { HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { AttributeType, Billing, TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
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

    const getCategoryLambda = new NodejsFunction(this, "GetCategory", {
      entry: "src/application/getCategory/index.ts", // Point to .ts source
      runtime: Runtime.NODEJS_22_X,
      handler: "handler", // Just 'handler', no 'index.' prefix needed
      memorySize: 128,
      bundling: {
        format: OutputFormat.ESM,
        mainFields: ["module", "main"],
        banner: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);"
      }
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

    const processNifLambda = new NodejsFunction(this, "ProcessNif", {
      runtime: Runtime.NODEJS_22_X,
      entry: "src/application/processNif/index.ts",
      handler: "handler",
      bundling: {
        format: OutputFormat.ESM,
        mainFields: ["module", "main"],
        externalModules: ["chromium-bidi", "@sparticuz/chromium"], // playwright and sparticuz will be handled by nodeModules
        nodeModules: ["playwright-core", "@sparticuz/chromium"],
        banner: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
        // Ensure esbuild target matches runtime
        target: "node22"
      },
      memorySize: 1024, // Upgrading to 2GB is safer for Playwright + Node 22
      timeout: Duration.seconds(30)
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
