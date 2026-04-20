const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPlans } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/plans', getPlans);
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;
