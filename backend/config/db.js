const { getDatabase, getDbPath } = require('./sqlite');

let isConnected = false;

const connectDB = async () => {
  try {
    const db = getDatabase();
    if (!isConnected) {
      console.log(`✅ SQLite Database connected successfully: ${getDbPath()}`);
      isConnected = true;
    }
    // Maintain readyState for legacy controllers checking database connection state
    try {
      const mongoose = require('mongoose');
      mongoose.connection.readyState = 1;
    } catch (_) {}
    return db;
  } catch (error) {
    console.error(`❌ SQLite Connection Error: ${error.message}`);
    try {
      const mongoose = require('mongoose');
      mongoose.connection.readyState = 0;
    } catch (_) {}
    throw error;
  }
};

module.exports = connectDB;
