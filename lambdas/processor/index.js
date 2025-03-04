const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const cloudwatch = new AWS.CloudWatch();

const TABLE_NAME = process.env.DYNAMODB_TABLE;
const QUARANTINE_BUCKET = process.env.QUARANTINE_BUCKET;

exports.handler = async (event) => {
  console.log("File uploaded event:", JSON.stringify(event, null, 2));

  const bucketName = event.Records[0].s3.bucket.name;
  const fileName = event.Records[0].s3.object.key;
  const timestamp = new Date().toISOString();

  console.log(`Processing file: ${fileName} from bucket: ${bucketName}`);

  // Start tracking processing time
  const startTime = Date.now();

  try {
    const file = await s3
      .getObject({ Bucket: bucketName, Key: fileName })
      .promise();
    const fileContent = file.Body.toString();

    // Simulate a failure for certain file names (for testing)
    if (fileName.includes("error")) {
      throw new Error("Simulated processing failure");
    }

    console.log("File content:", fileContent);

    const params = {
      TableName: TABLE_NAME,
      Item: {
        fileName: fileName,
        timestamp: timestamp,
        bucket: bucketName,
        status: "Processed",
      },
    };

    await dynamodb.put(params).promise();
    console.log("Stored metadata in DynamoDB:", params.Item);

    // Log Success Metric to CloudWatch
    await cloudwatch
      .putMetricData({
        Namespace: "SilentScalper",
        MetricData: [
          {
            MetricName: "SuccessfulFiles",
            Unit: "Count",
            Value: 1,
          },
          {
            MetricName: "ProcessingTime",
            Unit: "Milliseconds",
            Value: Date.now() - startTime,
          },
        ],
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "File processed and stored successfully!",
      }),
    };
  } catch (error) {
    console.error("Processing failed:", error);

    // Move failed file to Quarantine Bucket
    try {
      await s3
        .copyObject({
          Bucket: QUARANTINE_BUCKET,
          CopySource: `${bucketName}/${fileName}`,
          Key: fileName,
        })
        .promise();

      console.log(`Moved ${fileName} to quarantine bucket`);

      await s3.deleteObject({ Bucket: bucketName, Key: fileName }).promise();
      console.log(`Deleted original file: ${fileName}`);

      // Log Failure Metric to CloudWatch
      await cloudwatch
        .putMetricData({
          Namespace: "SilentScalper",
          MetricData: [
            {
              MetricName: "FailedFiles",
              Unit: "Count",
              Value: 1,
            },
          ],
        })
        .promise();
    } catch (quarantineError) {
      console.error("Failed to move file to quarantine:", quarantineError);
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "File processing failed. Moved to quarantine.",
      }),
    };
  }
};
