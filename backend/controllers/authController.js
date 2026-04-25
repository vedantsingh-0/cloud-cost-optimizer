const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }
    const token = generateToken(user._id);
    res.json({
      status: 'success', token,
      user: { id: user._id, name: user.name, email: user.email, isAwsConnected: user.isAwsConnected, role: user.role, plan: user.plan }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
