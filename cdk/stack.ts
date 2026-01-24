import * as path from "node:path";

import * as cdk from "aws-cdk-lib";
import { AttributeType, TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Queue } from "aws-cdk-lib/aws-sqs";
import type { Construct } from "constructs";

export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const processNifDLQ = new Queue(scope, "ProcessNifDLQ");
    const processNifSQS = new Queue(scope, "ProcessNifSQS", {
      deadLetterQueue: {
        queue: processNifDLQ,
        maxReceiveCount: 2
      }
    });

    const table = new TableV2(scope, "NifCategoryTable", {
      partitionKey: {
        type: AttributeType.NUMBER,
        name: "nif"
      },
      sortKey: {
        type: AttributeType.NUMBER,
        name: "category"
      }
    });

    const getCategoryLambda = new Function(scope, "GetCategory", {
      runtime: Runtime.NODEJS_22_X,
      handler: "index.handler",
      code: Code.fromAsset(path.join(__dirname, "lambda-handler"))
    });

    table.grantReadData(getCategoryLambda);
    getCategoryLambda.addEnvironment("NIF_CATEGORY_TABLE_NAME", table.tableName);

    processNifSQS.grantSendMessages(getCategoryLambda);
    getCategoryLambda.addEnvironment("PROCESS_NIF_SQS", processNifSQS.queueName);

    const processNifLambda = new Function(scope, "ProcessNif", {
      runtime: Runtime.NODEJS_22_X,
      handler: "index.handler",
      code: Code.fromAsset(path.join(__dirname, "lambda-handler"))
    });

    table.grantWriteData(processNifLambda);
    processNifLambda.addEnvironment("NIF_CATEGORY_TABLE_NAME", table.tableName);

    processNifSQS.grantConsumeMessages(processNifLambda);
    processNifLambda.addEnvironment("PROCESS_NIF_SQS", processNifSQS.queueName);
  }
}
