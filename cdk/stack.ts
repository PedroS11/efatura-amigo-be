import * as cdk from "aws-cdk-lib";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, Billing, TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import type { Construct } from "constructs";

import { createNoCostsBudget } from "./budget";
import { createHttpApi } from "./httpApi";
import {
  createAuthorizerLambda,
  createGetCategoryLambda,
  createGetCompanyLambda,
  createGetMetadataLambda,
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
      billing: Billing.onDemand(),
      removalPolicy: isMain() ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY
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

    /*
     *********************************
     *********** PRIVATE API *********
     *********************************
     */

    const authorizerLambda = createAuthorizerLambda(this);

    /**
     * Search Companies
     */

    const searchCompaniesLambda = createSearchCompaniesLambda(this);

    /**
     * Get company
     */

    const getCompanyLambda = createGetCompanyLambda(this);
    companiesTable.grantReadData(getCompanyLambda);
    getCompanyLambda.addEnvironment("COMPANIES_TABLE", companiesTable.tableName);

    /**
     * Get metadata
     */

    const getMetadataLambda = createGetMetadataLambda(this);
    companiesTable.grantReadData(getMetadataLambda);
    getMetadataLambda.addEnvironment("COMPANIES_TABLE", companiesTable.tableName);
    unprocessedCompaniesTable.grantReadData(getMetadataLambda);
    getMetadataLambda.addEnvironment("UNPROCESSED_COMPANIES_TABLE", unprocessedCompaniesTable.tableName);

    /**
     * HTTP Api
     */
    createHttpApi(
      this,
      getCategoryLambda,
      searchCompaniesLambda,
      getCompanyLambda,
      authorizerLambda,
      getMetadataLambda
    );

    /**
     * Set alerts to when hit free quotas
     */
    if (isMain()) {
      createNoCostsBudget(this);
    }
  }
}
