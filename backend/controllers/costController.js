const { costExplorer } = require('../config/aws');
const { GetCostAndUsageCommand } = require('@aws-sdk/client-cost-explorer');

const getMonthlyCost = async (req, res) => {
  try {
    const date = new Date();
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
      .toISOString().split('T')[0];
    const endDate = date.toISOString().split('T')[0];

    const command = new GetCostAndUsageCommand({
      TimePeriod: { Start: startDate, End: endDate },
      Granularity: 'MONTHLY',
      Metrics: ['BlendedCost'],
      GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }],
    });

    const response = await costExplorer.send(command);
    const results = response.ResultsByTime[0];
    
    const services = results.Groups.map(group => ({
      service: group.Keys[0],
      cost: parseFloat(group.Metrics.BlendedCost.Amount).toFixed(2),
      currency: group.Metrics.BlendedCost.Unit,
    }));

    const totalCost = services.reduce(
      (sum, s) => sum + parseFloat(s.cost), 0
    ).toFixed(2);

    res.json({
      status: 'success',
      period: { start: startDate, end: endDate },
      totalCost,
      currency: 'USD',
      services,
    });

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getDailyCost = async (req, res) => {
  try {
    const date = new Date();
    
    // Last 30 days
    const endDate = date.toISOString().split('T')[0];
    const startDate = new Date(date.setDate(date.getDate() - 30))
      .toISOString().split('T')[0];

    const command = new GetCostAndUsageCommand({
      TimePeriod: { Start: startDate, End: endDate },
      Granularity: 'DAILY',
      Metrics: ['BlendedCost'],
      GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }],
    });

    const response = await costExplorer.send(command);

    const dailyData = response.ResultsByTime.map(day => {
      const services = day.Groups.map(group => ({
        service: group.Keys[0],
        cost: parseFloat(group.Metrics.BlendedCost.Amount).toFixed(4),
      }));

      const totalCost = services.reduce(
        (sum, s) => sum + parseFloat(s.cost), 0
      ).toFixed(4);

      return {
        date: day.TimePeriod.Start,
        totalCost,
        services,
      };
    });

    // Find highest cost day
    const highestDay = dailyData.reduce((max, day) =>
      parseFloat(day.totalCost) > parseFloat(max.totalCost) ? day : max
    );

    // Find lowest cost day
    const lowestDay = dailyData.reduce((min, day) =>
      parseFloat(day.totalCost) < parseFloat(min.totalCost) ? day : min
    );

    // Calculate average daily cost
    const avgCost = (
      dailyData.reduce((sum, day) => sum + parseFloat(day.totalCost), 0) /
      dailyData.length
    ).toFixed(4);

    res.json({
      status: 'success',
      period: { start: startDate, end: endDate },
      summary: {
        averageDailyCost: avgCost,
        highestDay: {
          date: highestDay.date,
          cost: highestDay.totalCost,
        },
        lowestDay: {
          date: lowestDay.date,
          cost: lowestDay.totalCost,
        },
      },
      currency: 'USD',
      dailyData,
    });

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getMonthlyCost, getDailyCost };
