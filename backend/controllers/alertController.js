const nodemailer = require('nodemailer');
const { costExplorer } = require('../config/aws');
const { GetCostAndUsageCommand } = require('@aws-sdk/client-cost-explorer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"CloudOptimizer" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

const checkAndSendAlert = async (req, res) => {
  try {
    const { email, threshold } = req.body;
    const alertLimit = threshold || process.env.ALERT_THRESHOLD || 10;

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
    }));

    const totalCost = services
      .reduce((sum, s) => sum + parseFloat(s.cost), 0)
      .toFixed(2);

    const isOverLimit = parseFloat(totalCost) >= parseFloat(alertLimit);

    if (isOverLimit) {
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:30px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0">CloudOptimizer Alert</h1>
          </div>
          <div style="background:white;padding:30px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px">
            <h2 style="color:#dc2626">Cost Alert: $${totalCost} spent this month</h2>
            <p>Your threshold is set to $${alertLimit}</p>
            <p>Login to your dashboard to review and optimize costs.</p>
          </div>
        </div>
      `;

      await sendEmail(email, `AWS Cost Alert: $${totalCost} spent`, html);

      return res.json({
        status: 'success',
        alertSent: true,
        message: `Alert sent! Cost $${totalCost} exceeds $${alertLimit}`,
        totalCost,
      });
    }

    res.json({
      status: 'success',
      alertSent: false,
      message: `Cost $${totalCost} is within threshold $${alertLimit}`,
      totalCost,
    });

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const sendDailyReport = async (req, res) => {
  try {
    const { email } = req.body;

    const date = new Date();
    const endDate = date.toISOString().split('T')[0];
    const startDate = new Date(date.setDate(date.getDate() - 7))
      .toISOString().split('T')[0];

    const command = new GetCostAndUsageCommand({
      TimePeriod: { Start: startDate, End: endDate },
      Granularity: 'DAILY',
      Metrics: ['BlendedCost'],
    });

    const response = await costExplorer.send(command);

    const dailyData = response.ResultsByTime.map(day => ({
      date: day.TimePeriod.Start,
      cost: parseFloat(day.Total.BlendedCost.Amount).toFixed(4),
    }));

    const totalWeek = dailyData
      .reduce((sum, d) => sum + parseFloat(d.cost), 0)
      .toFixed(2);

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:30px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:white;margin:0">Weekly Cost Report</h1>
        </div>
        <div style="background:white;padding:30px;border:1px solid #e2e8f0;border-radius:0 0 12px 12px">
          <h2 style="color:#1e1b4b">Total this week: $${totalWeek}</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr style="background:#f8fafc">
              <th style="padding:10px;text-align:left">Date</th>
              <th style="padding:10px;text-align:left">Cost</th>
            </tr>
            ${dailyData.map(d => `
              <tr>
                <td style="padding:10px;border-bottom:1px solid #f0f0f0">${d.date}</td>
                <td style="padding:10px;border-bottom:1px solid #f0f0f0;color:#6366f1">$${d.cost}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      </div>
    `;

    await sendEmail(email, 'Weekly AWS Cost Report', html);

    res.json({
      status: 'success',
      message: 'Weekly report sent!',
      weekTotal: totalWeek,
    });

  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { checkAndSendAlert, sendDailyReport };