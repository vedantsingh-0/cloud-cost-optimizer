const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const plans = {
  pro: { amount: 99900, currency: 'INR', name: 'Pro Plan' },
  enterprise: { amount: 499900, currency: 'INR', name: 'Enterprise Plan' },
};

const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const selectedPlan = plans[plan];

    if (!selectedPlan) {
      return res.status(400).json({ status: 'error', message: 'Invalid plan' });
    }

    // Sanity-check that keys are actually present before calling Razorpay
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('RAZORPAY KEYS MISSING — KEY_ID:', !!process.env.RAZORPAY_KEY_ID, 'KEY_SECRET:', !!process.env.RAZORPAY_KEY_SECRET);
      return res.status(500).json({ status: 'error', message: 'Razorpay keys are not configured on the server' });
    }

    const order = await razorpay.orders.create({
      amount: selectedPlan.amount,
      currency: selectedPlan.currency,
      receipt: `order_${Date.now()}`,
      notes: { plan, planName: selectedPlan.name },
    });

    res.json({
      status: 'success',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      planName: selectedPlan.name,
    });
  } catch (error) {
    // Razorpay's SDK throws errors shaped like { statusCode, error: { code, description } }
    // instead of a plain Error, so error.message is often undefined. Log everything and
    // extract the real description so the frontend (and we) can see what's actually wrong.
    console.error('RAZORPAY CREATE ORDER ERROR (full):', JSON.stringify(error, null, 2));

    const realMessage =
      error?.error?.description ||
      error?.message ||
      error?.error?.code ||
      'Unknown Razorpay error — check server logs';

    res.status(500).json({ status: 'error', message: realMessage });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ status: 'error', message: 'Invalid payment signature' });
    }

    res.json({
      status: 'success',
      message: 'Payment verified successfully!',
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('RAZORPAY VERIFY ERROR (full):', JSON.stringify(error, null, 2));
    res.status(500).json({ status: 'error', message: error?.message || 'Verification failed' });
  }
};

const getPlans = async (req, res) => {
  res.json({
    status: 'success',
    plans: [
      {
        id: 'starter',
        name: 'Starter',
        price: 0,
        currency: 'INR',
        features: ['1 AWS account', 'Cost dashboard', 'Basic alerts', 'Email support'],
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 999,
        currency: 'INR',
        features: ['5 AWS accounts', 'Advanced analytics', 'Smart alerts', 'AI recommendations', 'Priority support'],
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 4999,
        currency: 'INR',
        features: ['Unlimited accounts', 'Custom reports', 'Slack integration', 'Dedicated support', 'SLA guarantee'],
      },
    ],
  });
};

module.exports = { createOrder, verifyPayment, getPlans };