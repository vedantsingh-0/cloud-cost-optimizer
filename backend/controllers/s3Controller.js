const { S3Client, ListBucketsCommand, GetBucketLocationCommand } = require('@aws-sdk/client-s3');
const { cloudWatch } = require('../config/aws');
const { GetMetricStatisticsCommand } = require('@aws-sdk/client-cloudwatch');
require('dotenv').config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const getS3Usage = async (req, res) => {
  try {
    // Get all buckets
    const bucketsResponse = await s3.send(new ListBucketsCommand({}));
    const buckets = bucketsResponse.Buckets;

    const bucketDetails = await Promise.all(buckets.map(async (bucket) => {
      try {
        // Get bucket size from CloudWatch
        const endTime = new Date();
        const startTime = new Date(endTime - 48 * 60 * 60 * 1000);

        const sizeResponse = await cloudWatch.send(new GetMetricStatisticsCommand({
          Namespace: 'AWS/S3',
          MetricName: 'BucketSizeBytes',
          Dimensions: [
            { Name: 'BucketName', Value: bucket.Name },
            { Name: 'StorageType', Value: 'StandardStorage' }
          ],
          StartTime: startTime,
          EndTime: endTime,
          Period: 86400,
          Statistics: ['Average'],
        }));

        // Get number of objects
        const objectsResponse = await cloudWatch.send(new GetMetricStatisticsCommand({
          Namespace: 'AWS/S3',
          MetricName: 'NumberOfObjects',
          Dimensions: [
            { Name: 'BucketName', Value: bucket.Name },
            { Name: 'StorageType', Value: 'AllStorageTypes' }
          ],
          StartTime: startTime,
          EndTime: endTime,
          Period: 86400,
          Statistics: ['Average'],
        }));

        const sizeBytes = sizeResponse.Datapoints[0]?.Average || 0;
        const sizeGB = (sizeBytes / (1024 ** 3)).toFixed(4);
        const numObjects = objectsResponse.Datapoints[0]?.Average || 0;

        // S3 costs $0.023 per GB
        const estimatedCost = (parseFloat(sizeGB) * 0.023).toFixed(4);

        return {
          bucketName: bucket.Name,
          createdDate: bucket.CreationDate,
          sizeGB: parseFloat(sizeGB),
          numberOfObjects: Math.round(numObjects),
          estimatedMonthlyCost: `$${estimatedCost}`,
          recommendation: parseFloat(sizeGB) === 0
            ? 'Empty bucket — consider deleting to avoid confusion'
            : parseFloat(sizeGB) > 100
            ? 'Large bucket — consider S3 lifecycle policies to save cost'
            : 'Bucket size is optimal',
        };
      } catch (err) {
        return {
          bucketName: bucket.Name,
          createdDate: bucket.CreationDate,
          sizeGB: 0,
          numberOfObjects: 0,
          estimatedMonthlyCost: '$0.00',
          recommendation: 'Could not fetch metrics',
        };
      }
    }));

    const totalSizeGB = bucketDetails
      .reduce((sum, b) => sum + b.sizeGB, 0).toFixed(4);
    
    const totalCost = bucketDetails
      .reduce((sum, b) => sum + parseFloat(b.estimatedMonthlyCost.replace('$','')), 0)
      .toFixed(4);

    res.json({
      status: 'success',
      summary: {
        totalBuckets: buckets.length,
        totalSizeGB,
        estimatedMonthlyCost: `$${totalCost}`,
      },
      buckets: bucketDetails,
    });

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getS3Usage };
