const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ status: 'error', message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.status(201).json({ status: 'success', token, user: { id: user._id, name: user.name, email: user.email, isAwsConnected: false, role: user.role } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    const token = generateToken(user._id);
    res.json({ status: 'success', token, user: { id: user._id, name: user.name, email: user.email, isAwsConnected: user.isAwsConnected, role: user.role, plan: user.plan } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -awsSecretAccessKey');
    res.json({ status: 'success', user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const saveAwsCredentials = async (req, res) => {
  try {
    const { awsAccessKeyId, awsSecretAccessKey, awsRegion } = req.body;
    await User.findByIdAndUpdate(req.userId, {
      awsAccessKeyId, awsSecretAccessKey,
      awsRegion: awsRegion || 'us-east-1',
      isAwsConnected: true,
    });
    res.json({ status: 'success', message: 'AWS credentials saved!' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Admin: get all users
const getAllUsers = async (req, res) => {
  try {
    const requestingUser = await User.findById(req.userId);
    if (requestingUser.role !== 'admin') return res.status(403).json({ status: 'error', message: 'Admin only' });
    const users = await User.find().select('-password -awsSecretAccessKey');
    res.json({ status: 'success', count: users.length, users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { register, login, getMe, saveAwsCredentials, getAllUsers };
