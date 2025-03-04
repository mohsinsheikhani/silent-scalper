import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3_notifications from "aws-cdk-lib/aws-s3-notifications";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";

import { S3Resource } from "./s3";
import { DynamoDBResource } from "./dynamodb";

export interface LambdaProps {
  s3Bucket: S3Resource;
  dynamoDB: DynamoDBResource;
}

export class LambdaResource extends Construct {
  public readonly processingLambda: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaProps) {
    super(scope, id);

    const nodeJsFunctionProps: NodejsFunctionProps = {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      entry: path.join(__dirname, "../../lambdas/processor/index.js"),
      timeout: cdk.Duration.seconds(30),
      environment: {
        DYNAMODB_TABLE: props.dynamoDB.table.tableName,
        QUARANTINE_BUCKET: props.s3Bucket.quarantineBucket.bucketName,
      },
      bundling: {
        externalModules: ["aws-sdk"],
        minify: true,
      },
    };

    this.processingLambda = new NodejsFunction(this, "ProcessingLambda", {
      ...nodeJsFunctionProps,
    });

    const lambdaPolicy = new iam.PolicyStatement({
      actions: ["cloudwatch:PutMetricData"],
      resources: ["*"],
      effect: iam.Effect.ALLOW,
      conditions: {
        StringEquals: { "cloudwatch:namespace": "SilentScalper" },
      },
    });

    this.processingLambda.addToRolePolicy(lambdaPolicy);

    props.s3Bucket.sourceBucket.grantRead(this.processingLambda);
    props.s3Bucket.sourceBucket.grantDelete(this.processingLambda);

    props.dynamoDB.table.grantWriteData(this.processingLambda);

    props.s3Bucket.quarantineBucket.grantWrite(this.processingLambda);

    props.s3Bucket.sourceBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3_notifications.LambdaDestination(this.processingLambda)
    );
  }
}
