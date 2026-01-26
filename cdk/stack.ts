import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import { AttributeType, Billing, TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import type { Construct } from "constructs";

import { createHttpApi } from "./httpApi";
import { createGetCategoryLambda, createProcessNifsLambda } from "./lambdas";

export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Companies Table
     */
    const companiesTable = new TableV2(this, "CompaniesTable", {
      partitionKey: {
        type: AttributeType.NUMBER,
        name: "nif"
      },
      billing: Billing.onDemand()
    });

    /**
     * UnprocessedCompanies Table
     */
    const unprocessedCompaniesTable = new TableV2(this, "UnprocessedCompaniesTable", {
      partitionKey: {
        type: AttributeType.NUMBER,
        name: "nif"
      },
      billing: Billing.onDemand()
    });

    /**
     * getCategory lambda
     */
    const getCategoryLambda = createGetCategoryLambda(this);

    companiesTable.grantReadData(getCategoryLambda);
    getCategoryLambda.addEnvironment("COMPANIES_TABLE", companiesTable.tableName);

    unprocessedCompaniesTable.grantWriteData(getCategoryLambda);
    getCategoryLambda.addEnvironment("UNPROCESSED_COMPANIES_TABLE", unprocessedCompaniesTable.tableName);

    /**
     * processNifs lambda
     */
    const processNifsLambda = createProcessNifsLambda(this);

    companiesTable.grantReadWriteData(processNifsLambda);
    processNifsLambda.addEnvironment("COMPANIES_TABLE", companiesTable.tableName);

    unprocessedCompaniesTable.grantReadWriteData(processNifsLambda);
    processNifsLambda.addEnvironment("UNPROCESSED_COMPANIES_TABLE", unprocessedCompaniesTable.tableName);

    const processNifsRule = new Rule(this, "ProcessNifsRule", {
      schedule: Schedule.rate(Duration.minutes(2)),
      enabled: false
    });
    processNifsRule.addTarget(new LambdaFunction(processNifsLambda));

    /**
     * HTTP Api
     */
    createHttpApi(this, getCategoryLambda);
  }
}
