#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { Stack } from "./stack";

const app = new cdk.App();
new Stack(app, "EfaturaAmigoBeStack", {
  env: {
    region: "eu-west-2",
    account: "566348719618"
  }
});
