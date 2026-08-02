require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');
const startExpiryJob = require('./cron/expireListings');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);
  startExpiryJob();

  server.listen(PORT, () => {
    console.log(`[server] FoodShare API running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
};

start();
