const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');

const costRoutes = require('./routes/costRoutes');
const ec2Routes = require('./routes/ec2Routes');
const s3Routes = require('./routes/s3Routes');
const authRoutes = require('./routes/authRoutes');
const alertRoutes = require('./routes/alertRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.json({ message: 'Cloud Cost Optimizer API running!', status: 'success' });
});

app.use('/api/auth', authRoutes);
app.use('/api/cost', costRoutes);
app.use('/api/ec2', ec2Routes);
app.use('/api/s3', s3Routes);
app.use('/api/alerts', alertRoutes);
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
