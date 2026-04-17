const express = require('express');
const router = express.Router();
const { checkAndSendAlert, sendDailyReport } = require('../controllers/alertController');

router.post('/check', checkAndSendAlert);
router.post('/daily-report', sendDailyReport);

module.exports = router;
