#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { Stack } from "./stack";

const app = new cdk.App();

const getStackName = () => {
  let stackname = "EfaturaAmigoBeStack";
  if (process.env.DEPLOY_ENV) {
    stackname += `--${process.env.DEPLOY_ENV}`;
  }

  return stackname;
};

new Stack(app, getStackName(), {
  env: {
    region: "eu-west-2",
    account: "566348719618"
  }
});
