const { ec2, cloudWatch } = require('../config/aws');
const { DescribeInstancesCommand } = require('@aws-sdk/client-ec2');
const { GetMetricStatisticsCommand } = require('@aws-sdk/client-cloudwatch');

const getIdleInstances = async (req, res) => {
  try {
    // Get all running EC2 instances
    const ec2Command = new DescribeInstancesCommand({
      Filters: [{ Name: 'instance-state-name', Values: ['running'] }]
    });

    const ec2Response = await ec2.send(ec2Command);
    const instances = [];

    for (const reservation of ec2Response.Reservations) {
      for (const instance of reservation.Instances) {
        // Get CPU usage for last 24 hours
        const endTime = new Date();
        const startTime = new Date(endTime - 24 * 60 * 60 * 1000);

        const cwCommand = new GetMetricStatisticsCommand({
          Namespace: 'AWS/EC2',
          MetricName: 'CPUUtilization',
          Dimensions: [{ Name: 'InstanceId', Value: instance.InstanceId }],
          StartTime: startTime,
          EndTime: endTime,
          Period: 3600,
          Statistics: ['Average'],
        });

        const cwResponse = await cloudWatch.send(cwCommand);
        const datapoints = cwResponse.Datapoints;

        // Calculate average CPU
        const avgCPU = datapoints.length > 0
          ? (datapoints.reduce((sum, dp) => sum + dp.Average, 0) / 
             datapoints.length).toFixed(2)
          : 0;

        // Get instance name from tags
        const nameTag = instance.Tags?.find(tag => tag.Key === 'Name');
        const instanceName = nameTag ? nameTag.Value : 'Unnamed';

        // Determine if idle (less than 5% CPU)
        const isIdle = parseFloat(avgCPU) < 5;

        // Estimate monthly cost based on instance type
        const costMap = {
          't2.micro': 8.47,
          't2.small': 16.94,
          't2.medium': 33.87,
          't3.micro': 7.59,
          't3.small': 15.18,
          't3.medium': 30.37,
          't3.large': 60.74,
          't3.xlarge': 121.47,
        };

        const estimatedMonthlyCost = costMap[instance.InstanceType] || 50;

        instances.push({
          instanceId: instance.InstanceId,
          instanceName,
          instanceType: instance.InstanceType,
          state: instance.State.Name,
          launchTime: instance.LaunchTime,
          availabilityZone: instance.Placement.AvailabilityZone,
          avgCPUPercent: avgCPU,
          isIdle,
          estimatedMonthlyCost,
          recommendation: isIdle
            ? `Instance is idle! Stop it to save $${estimatedMonthlyCost}/month`
            : 'Instance is actively used',
        });
      }
    }

    // Separate idle and active
    const idleInstances = instances.filter(i => i.isIdle);
    const activeInstances = instances.filter(i => !i.isIdle);
    const totalWaste = idleInstances
      .reduce((sum, i) => sum + i.estimatedMonthlyCost, 0)
      .toFixed(2);

    res.json({
      status: 'success',
      summary: {
        totalInstances: instances.length,
        idleInstances: idleInstances.length,
        activeInstances: activeInstances.length,
        estimatedMonthlySavings: `$${totalWaste}`,
      },
      idleInstances,
      activeInstances,
    });

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getIdleInstances };
