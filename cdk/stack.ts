import * as cdk from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import { AttributeType, Billing, TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import type { Construct } from "constructs";

import { createNoCostsBudget } from "./budget";
import { createHttpApi } from "./httpApi";
import {
  createGetCategoryLambda,
  createProcessNifsLambda,
  createResyncLambda,
  createSearchCompaniesLambda
} from "./lambdas";
import { isMain } from "./utils";

export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Companies Table
     */
    const companiesTable = TableV2.fromTableArn(
      this,
      "CompaniesTable",
      "arn:aws:dynamodb:eu-west-2:566348719618:table/EfaturaAmigoBeStack-CompaniesTable16712407-1K4NMA25X9EQZ"
    );
    //     new TableV2(this, "CompaniesTable", {
    //   partitionKey: {
    //     type: AttributeType.NUMBER,
    //     name: "nif"
    //   },
    //   billing: Billing.onDemand()
    // });

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
      enabled: true
    });
    processNifsRule.addTarget(new LambdaFunction(processNifsLambda));

    /**
     * Resync lambda
     */

    const resyncLambda = createResyncLambda(this);
    companiesTable.grantReadWriteData(resyncLambda);
    unprocessedCompaniesTable.grantWriteData(resyncLambda);
    resyncLambda.addEnvironment("COMPANIES_TABLE", companiesTable.tableName);
    resyncLambda.addEnvironment("UNPROCESSED_COMPANIES_TABLE", unprocessedCompaniesTable.tableName);

    /**
     * Search Companies
     */

    createSearchCompaniesLambda(this);

    /**
     * HTTP Api
     */
    createHttpApi(this, getCategoryLambda);

    /**
     * Set alerts to when hit free quotas
     */
    if (isMain()) {
      createNoCostsBudget(this);
    }
  }
}
