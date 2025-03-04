import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { S3Resource } from "./constructs/s3";
import { LambdaResource } from "./constructs/lambda";
import { DynamoDBResource } from "./constructs/dynamodb";
import { MonitoringResource } from "./constructs/monitoring";
import { SlackNotifierResource } from "./constructs/slack-notifier";

export class SilentScalperStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const s3Bucket = new S3Resource(this, "S3Bucket");

    const dynamoDB = new DynamoDBResource(this, "DynamoDBTable");

    const slackNotifier = new SlackNotifierResource(this, "SlackNotifier");

    new MonitoringResource(this, "Monitoring", slackNotifier);

    new LambdaResource(this, "LambdaProcessor", {
      s3Bucket,
      dynamoDB,
    });
  }
}
