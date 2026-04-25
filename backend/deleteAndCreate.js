const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = 'mongodb+srv://sr9453300_db_user:SRFhqANpdDQMKYMz@cloud-cost-optimizer.xs9osvy.mongodb.net/cloudcostdb';

mongoose.connect(uri).then(async () => {
  const User = require('./models/User');
  await User.deleteMany({});
  console.log('Deleted all users');
  
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('123456', salt);
  
  await User.create({
    name: 'Vedant',
    email: 'vedantsingh00009@gmail.com',
    password: hash,
    role: 'admin'
  });
  
  console.log('Created admin user!');
  mongoose.disconnect();
});
