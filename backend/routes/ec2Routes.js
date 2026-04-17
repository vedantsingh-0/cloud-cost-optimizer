const express = require('express');
const router = express.Router();
const { getIdleInstances } = require('../controllers/ec2Controller');

router.get('/idle', getIdleInstances);

module.exports = router;
