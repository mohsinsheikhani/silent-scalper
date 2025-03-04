import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sns from "aws-cdk-lib/aws-sns";
import * as sns_subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as path from "path";

export class SlackNotifierResource extends Construct {
  public readonly slackLambda: lambda.Function;
  public readonly slackTopic: sns.Topic;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create SNS Topic for CloudWatch Alarms
    this.slackTopic = new sns.Topic(this, "SlackAlertsTopic");

    // Create Lambda Function to Send Slack Messages
    this.slackLambda = new lambda.Function(this, "SlackNotifierLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../lambdas/slack-notifier")
      ),
      environment: {
        SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL!,
      },
    });

    this.slackTopic.addSubscription(
      new sns_subscriptions.LambdaSubscription(this.slackLambda)
    );
  }
}
