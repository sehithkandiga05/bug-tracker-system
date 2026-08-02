const mongoose = require('mongoose');

let isInMemoryMode = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bug_tracker_db', {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    isInMemoryMode = false;
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to external MongoDB server: ${error.message}`);
    console.warn(`[Database Fallback] Operating in Dynamic Memory Mode for immediate demo/testing.`);
    isInMemoryMode = true;
  }
};

const getDBMode = () => ({ isInMemoryMode });

module.exports = { connectDB, getDBMode };
