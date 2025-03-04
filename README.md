# Self-Healing, Serverless Data Processing Pipeline on AWS

## Overview

This project implements a self-healing, fully serverless, auto-scaling data processing pipeline on AWS. It dynamically processes files, handles failures, and sends real-time alerts via Slack & SNS, ensuring fault tolerance and cost efficiency.

## Features

- **Event-Driven Processing** → Triggers data processing only when needed (zero idle costs).
- **Auto-Scaling** → AWS Lambda scales instantly to handle workloads of any size.
- **Self-Healing** → Failed jobs are automatically quarantined for review and reprocessing.
- **Real-Time Monitoring** → CloudWatch tracks system health, and SNS sends Slack alerts for failures.

## Architecture

![Architecture Diagram](https://github.com/user-attachments/assets/af6b480e-6e57-4ffe-b497-82d2a3e4ec50)


### **Workflow**

1. **S3 Event-Triggered Processing:** A file upload to Amazon S3 triggers an AWS Lambda function.
2. **Data Processing & Storage:** Lambda processes the file and stores structured data in Amazon DynamoDB.
3. **Failure Handling:** If processing fails, the file is moved to a Quarantine S3 Bucket.
4. **Real-Time Monitoring:** CloudWatch tracks system performance (file processing success/failure rates).
5. **Instant Slack Alerts:** SNS notifies engineers on critical failures for faster incident response.

## Tech Stack

- **Amazon S3** → File storage & event triggering
- **AWS Lambda** → Serverless data processing
- **Amazon DynamoDB** → NoSQL storage for processed data
- **Amazon CloudWatch** → Monitoring & alerting
- **Amazon SNS** → Real-time notifications
- **Slack Webhooks** → Alerts for engineers

## Deployment (AWS CDK)

This project is deployed using **AWS CDK**.

### **Prerequisites**

- **AWS CLI** configured
- **AWS CDK** installed (`npm install -g aws-cdk`)
- **Node.js & npm** installed

### **Deployment Steps**

```sh
# Clone the repository
git clone https://github.com/mohsinsheikhani/silent-scalper.git
cd silent-scalper

# Install dependencies
npm install

# Bootstrap AWS CDK (if not done already)
npx cdk bootstrap

# Deploy the CDK stack
npx cdk deploy
```

## Monitoring & Alerts

- **CloudWatch Metrics** → Tracks success/failure rates and execution times.
- **CloudWatch Alarms** → Triggers SNS notifications for high failure rates.
- **Slack Alerts** → Engineers receive real-time failure notifications via SNS.

## Troubleshooting

- **Check CloudWatch Logs** → `aws logs tail /aws/lambda/<function-name> --follow`
- **Verify SNS Subscriptions** → Ensure the SNS topic is correctly linked to Slack.
- **Inspect Failed Files in S3** → Quarantined files are stored for manual review.

## Article on Medium
Find the article on Medium [Serverless Data Processing Pipeline on AWS]([https://www.linkedin.com/in/mohsin-sheikhani/](https://mohsinsheikhani.medium.com/1a26aa9998d1)) 

---

🚀 **Follow me on [LinkedIn](https://www.linkedin.com/in/mohsin-sheikhani/) for more AWS content!**
