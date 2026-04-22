const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  awsAccessKeyId: { type: String, default: '' },
  awsSecretAccessKey: { type: String, default: '' },
  awsRegion: { type: String, default: 'us-east-1' },
  isAwsConnected: { type: Boolean, default: false },
  plan: { type: String, enum: ['starter', 'pro', 'enterprise'], default: 'starter' },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
