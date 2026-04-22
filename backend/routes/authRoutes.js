const express = require('express');
const router = express.Router();
const { register, login, getMe, saveAwsCredentials, getAllUsers } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/aws-credentials', protect, saveAwsCredentials);
router.get('/admin/users', protect, getAllUsers);

module.exports = router;
