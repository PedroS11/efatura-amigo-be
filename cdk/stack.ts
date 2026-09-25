import * as cdk from "aws-cdk-lib";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, Billing, StreamViewType, TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { StartingPosition } from "aws-cdk-lib/aws-lambda";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import type { Construct } from "constructs";
import { createNoCostsBudget } from "./budget";
import { createHttpApi } from "./httpApi";
import {
  createAuthorizerLambda,
  createGetCategoryLambda,
  createGetCompanyLambda,
  createGetMeLambda,
  createGetMetadataLambda,
  createLoginLambda,
  createLogoutLambda,
  createProcessNifsLambda,
  createResyncLambda,
  createSearchCompaniesLambda,
  createUpdateAlgoliaLambda
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
      billing: Billing.onDemand(),
      removalPolicy: isMain() ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      dynamoStream: StreamViewType.NEW_IMAGE
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
     * Sessions Table
     */

    const sessionsTable = new TableV2(this, "SessionsTable", {
      partitionKey: {
        type: AttributeType.STRING,
        name: "id"
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
     * UpdateAlgolia
     */

    const updateAlgoliaLambda = createUpdateAlgoliaLambda(this);

    updateAlgoliaLambda.addEventSource(
      new DynamoEventSource(companiesTable, {
        startingPosition: StartingPosition.LATEST,
        batchSize: 10
      })
    );

    /**
     * Resync lambda
     */

    const resyncLambda = createResyncLambda(this);

    companiesTable.grantReadWriteData(resyncLambda);
    unprocessedCompaniesTable.grantWriteData(resyncLambda);
    resyncLambda.addEnvironment("COMPANIES_TABLE", companiesTable.tableName);
    resyncLambda.addEnvironment("UNPROCESSED_COMPANIES_TABLE", unprocessedCompaniesTable.tableName);

    /**
     * Logout lambda
     */

    const logoutLambda = createLogoutLambda(this);

    sessionsTable.grantWriteData(logoutLambda);
    logoutLambda.addEnvironment("SESSIONS_TABLE", sessionsTable.tableName);

    /*
     *********************************
     *********** PRIVATE API *********
     *********************************
     */

    /**
     * Authorizer
     */

    const authorizerLambda = createAuthorizerLambda(this);

    sessionsTable.grantReadData(authorizerLambda);
    authorizerLambda.addEnvironment("SESSIONS_TABLE", sessionsTable.tableName);

    /**
     * Login
     */

    const loginLambda = createLoginLambda(this);

    sessionsTable.grantWriteData(loginLambda);
    loginLambda.addEnvironment("SESSIONS_TABLE", sessionsTable.tableName);

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
     * Get me
     */

    const getMeLambda = createGetMeLambda(this);

    /**
     * HTTP Api
     */

    createHttpApi(
      this,
      getCategoryLambda,
      searchCompaniesLambda,
      getCompanyLambda,
      authorizerLambda,
      getMetadataLambda,
      loginLambda,
      logoutLambda,
      getMeLambda
    );

    /**
     * Set alerts to when hit free quotas
     */

    if (isMain()) {
      createNoCostsBudget(this);
    }
  }
}
