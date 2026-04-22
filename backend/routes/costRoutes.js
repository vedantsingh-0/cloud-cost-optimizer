const express = require('express');
const router = express.Router();
const { getMonthlyCost, getDailyCost } = require('../controllers/costController');
const { protect } = require('../middleware/auth');

router.get('/monthly', protect, getMonthlyCost);
router.get('/daily', protect, getDailyCost);

module.exports = router;
