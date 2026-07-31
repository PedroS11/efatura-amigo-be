#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { Stack } from "./stack";
import { getBranchName, isMain } from "./utils";

const app = new cdk.App();

const getStackName = () => {
  let stackname = "EfaturaAmigoBeStack";
  if (!isMain()) {
    stackname += `--${getBranchName()}`;
  }

  return stackname;
};

new Stack(app, getStackName(), {
  env: {
    region: "eu-west-2",
    account: "566348719618"
  }
});
