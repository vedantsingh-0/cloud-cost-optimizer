const { CostExplorerClient, GetCostAndUsageCommand } = require('@aws-sdk/client-cost-explorer');
const User = require('../models/User');

const getClientForUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.isAwsConnected) throw new Error('AWS not connected. Please add your AWS credentials in Settings.');
  return new CostExplorerClient({
    region: user.awsRegion || 'us-east-1',
    credentials: {
      accessKeyId: user.awsAccessKeyId,
      secretAccessKey: user.awsSecretAccessKey,
    }
  });
};

const getMonthlyCost = async (req, res) => {
  try {
    const costExplorer = await getClientForUser(req.userId);
    const date = new Date();
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const endDate = date.toISOString().split('T')[0];

    const response = await costExplorer.send(new GetCostAndUsageCommand({
      TimePeriod: { Start: startDate, End: endDate },
      Granularity: 'MONTHLY',
      Metrics: ['BlendedCost'],
      GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }],
    }));

    const results = response.ResultsByTime[0];
    const services = results.Groups.map(g => ({
      service: g.Keys[0],
      cost: parseFloat(g.Metrics.BlendedCost.Amount).toFixed(2),
      currency: g.Metrics.BlendedCost.Unit,
    }));
    const totalCost = services.reduce((s, x) => s + parseFloat(x.cost), 0).toFixed(2);

    res.json({ status: 'success', period: { start: startDate, end: endDate }, totalCost, currency: 'USD', services });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getDailyCost = async (req, res) => {
  try {
    const costExplorer = await getClientForUser(req.userId);
    const date = new Date();
    const endDate = date.toISOString().split('T')[0];
    const startDate = new Date(date.setDate(date.getDate() - 30)).toISOString().split('T')[0];

    const response = await costExplorer.send(new GetCostAndUsageCommand({
      TimePeriod: { Start: startDate, End: endDate },
      Granularity: 'DAILY',
      Metrics: ['BlendedCost'],
      GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }],
    }));

    const dailyData = response.ResultsByTime.map(day => {
      const services = day.Groups.map(g => ({ service: g.Keys[0], cost: parseFloat(g.Metrics.BlendedCost.Amount).toFixed(4) }));
      const totalCost = services.reduce((s, x) => s + parseFloat(x.cost), 0).toFixed(4);
      return { date: day.TimePeriod.Start, totalCost, services };
    });

    const highestDay = dailyData.reduce((max, d) => parseFloat(d.totalCost) > parseFloat(max.totalCost) ? d : max);
    const lowestDay = dailyData.reduce((min, d) => parseFloat(d.totalCost) < parseFloat(min.totalCost) ? d : min);
    const avgCost = (dailyData.reduce((s, d) => s + parseFloat(d.totalCost), 0) / dailyData.length).toFixed(4);

    res.json({ status: 'success', summary: { averageDailyCost: avgCost, highestDay: { date: highestDay.date, cost: highestDay.totalCost }, lowestDay: { date: lowestDay.date, cost: lowestDay.totalCost } }, currency: 'USD', dailyData });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getMonthlyCost, getDailyCost };
