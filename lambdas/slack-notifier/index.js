import fetch from "node-fetch";

const sendSlackNotification = async (message) => {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    const response = await fetch(webhookUrl, {
      method: "POST",
      body: JSON.stringify(message),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Error sending message to Slack: ${response.statusText}`);
    }

    const data = await response.json();
    return `Message sent to Slack: ${JSON.stringify(data)}`;
  } catch (error) {
    throw new Error(`Error sending message to Slack: ${error.message}`);
  }
};

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  try {
    const message = JSON.parse(event.Records[0].Sns.Message);
    const alarmName = message.AlarmName;
    const newState = message.NewStateValue;
    const reason = message.NewStateReason;

    const slackMessage = {
      text: `🚨 *CloudWatch Alarm Triggered!* 🚨\n*Alarm:* ${alarmName}\n*State:* ${newState}\n*Reason:* ${reason}`,
    };

    return await sendSlackNotification(slackMessage);
  } catch (error) {
    console.error("Error processing event:", error);
    throw error;
  }
};
