const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const songRoutes = require('./routes/songRoutes');
const messageRoutes = require('./routes/messageRoutes');
const shortMessageRoutes = require('./routes/shortMessageRoutes');
const actionSongRoutes = require('./routes/actionSongRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dailyPromiseRoutes = require('./routes/dailyPromiseRoutes');
const pushRoutes = require('./routes/pushRoutes');
const authRoutes = require('./routes/authRoutes');
const socialChannelRoutes = require('./routes/socialChannelRoutes');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/songs', songRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/short-messages', shortMessageRoutes);
app.use('/api/action-songs', actionSongRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/daily-promises', dailyPromiseRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/social-channels', socialChannelRoutes);
app.get('/', (req, res) => {
  res.send('JCPM ELURU Backend is Running Successfully!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`JCPM ELURU Backend running on port ${PORT}`);
});

// Atlas hosts discovered from your SRV record
const atlasHosts = [
  'ac-eho34sc-shard-00-00.63hafuw.mongodb.net',
  'ac-eho34sc-shard-00-01.63hafuw.mongodb.net',
  'ac-eho34sc-shard-00-02.63hafuw.mongodb.net'
];

async function startServer() {
  try {
    // Convert mongodb+srv:// to direct seed-list connection
    const originalUri = process.env.MONGO_URI;

    const match = originalUri.match(/^mongodb\+srv:\/\/([^@]+)@[^/]+(\/.*)?$/);

    if (!match) {
      throw new Error('Invalid MONGO_URI format');
    }

    const credentials = match[1];

    const mongoUri =
      `mongodb://${credentials}@${atlasHosts.join(',')}/` +
      `?tls=true&retryWrites=true&w=majority`;

    console.log('Connecting to MongoDB Atlas...');

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    });

    console.log('MongoDB Connected Successfully!');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });

    require('./notificationScheduler');

  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
}

startServer();