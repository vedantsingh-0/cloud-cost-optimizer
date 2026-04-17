const express = require('express');
const router = express.Router();
const { getS3Usage } = require('../controllers/s3Controller');

router.get('/usage', getS3Usage);

module.exports = router;
