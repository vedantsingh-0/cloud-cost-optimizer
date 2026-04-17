const express = require('express');
const router = express.Router();
const { getMonthlyCost, getDailyCost } = require('../controllers/costController');

router.get('/monthly', getMonthlyCost);
router.get('/daily', getDailyCost);

module.exports = router;
