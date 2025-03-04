import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";

export class S3Resource extends Construct {
  public readonly sourceBucket: s3.Bucket;
  public readonly quarantineBucket: s3.Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.sourceBucket = new s3.Bucket(this, "SourceBucket", {
      bucketName: `silent-scalper-source-bucket-${cdk.Aws.ACCOUNT_ID}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      eventBridgeEnabled: true,
    });

    this.quarantineBucket = new s3.Bucket(this, "QuarantineBucket", {
      bucketName: `silent-scalper-quarantine-bucket-${cdk.Aws.ACCOUNT_ID}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: true,
    });

    new cdk.CfnOutput(this, "SourceBucketName", {
      value: this.sourceBucket.bucketName,
    });

    new cdk.CfnOutput(this, "QuarantineBucketName", {
      value: this.quarantineBucket.bucketName,
    });
  }
}
