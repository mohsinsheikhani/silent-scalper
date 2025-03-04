import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as cloudwatch_actions from "aws-cdk-lib/aws-cloudwatch-actions";

import { SlackNotifierResource } from "./slack-notifier";

export class MonitoringResource extends Construct {
  constructor(
    scope: Construct,
    id: string,
    slackNotifier: SlackNotifierResource
  ) {
    super(scope, id);

    // CloudWatch Alarm for Failed Files
    const failedFilesAlarm = new cloudwatch.Alarm(this, "FailedFilesAlarm", {
      metric: new cloudwatch.Metric({
        namespace: "SilentScalper",
        metricName: "FailedFiles",
        statistic: "Sum",
        period: cdk.Duration.minutes(5),
      }),
      threshold: 5, // If 5 files fail in 5 minutes, trigger alert
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    failedFilesAlarm.addAlarmAction(
      new cloudwatch_actions.SnsAction(slackNotifier.slackTopic)
    );

    // CloudWatch Alarm for High Processing Time
    const processingTimeAlarm = new cloudwatch.Alarm(
      this,
      "ProcessingTimeAlarm",
      {
        metric: new cloudwatch.Metric({
          namespace: "SilentScalper",
          metricName: "ProcessingTime",
          statistic: "Average",
          period: cdk.Duration.minutes(5),
        }),
        threshold: 5000, // If processing time exceeds 5 seconds
        evaluationPeriods: 1,
        comparisonOperator:
          cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      }
    );

    processingTimeAlarm.addAlarmAction(
      new cloudwatch_actions.SnsAction(slackNotifier.slackTopic)
    );
  }
}
