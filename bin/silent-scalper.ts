#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { SilentScalperStack } from "../lib/silent-scalper-stack";

const app = new cdk.App();
new SilentScalperStack(app, "SilentScalperStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
