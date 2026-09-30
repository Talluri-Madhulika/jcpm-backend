const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');

const atlasHosts = [
  'ac-eho34sc-shard-00-00.63hafuw.mongodb.net',
  'ac-eho34sc-shard-00-01.63hafuw.mongodb.net',
  'ac-eho34sc-shard-00-02.63hafuw.mongodb.net'
];

async function run() {
  try {
    const originalUri = process.env.MONGO_URI;
    const match = originalUri.match(/^mongodb\+srv:\/\/([^@]+)@[^/]+(\/.*)?$/);

    const credentials = match[1];

    const mongoUri =
      `mongodb://${credentials}@${atlasHosts.join(',')}/` +
      `?tls=true&retryWrites=true&w=majority`;

    await mongoose.connect(mongoUri);

    const email = 'YOUR_EMAIL_HERE';

    const newPassword = '12345678';

    const user = await User.findOne({ email });

    if (!user) {
      console.log('USER NOT FOUND');
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    console.log('PASSWORD UPDATED SUCCESSFULLY!');
    console.log('Email:', email);
    console.log('Password:', newPassword);

  } catch (error) {
    console.log(error);
  } finally {
    await mongoose.disconnect();
  }
}

run();