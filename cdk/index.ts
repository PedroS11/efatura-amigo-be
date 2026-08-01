#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { Stack } from "./stack";
import { getStackName } from "./utils";

const app = new cdk.App();

new Stack(app, getStackName(), {
  env: {
    region: "eu-west-2",
    account: "566348719618"
  }
});
