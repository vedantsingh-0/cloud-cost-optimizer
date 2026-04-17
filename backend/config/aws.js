const { CostExplorerClient } = require('@aws-sdk/client-cost-explorer');
const { CloudWatchClient } = require('@aws-sdk/client-cloudwatch');
const { EC2Client } = require('@aws-sdk/client-ec2');
require('dotenv').config();

const config = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
};

const costExplorer = new CostExplorerClient(config);
const cloudWatch = new CloudWatchClient(config);
const ec2 = new EC2Client(config);

module.exports = { costExplorer, cloudWatch, ec2 };
