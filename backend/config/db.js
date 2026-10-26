const { getDatabase, getDbPath, getPgPool } = require('./sqlite');

let isConnected = false;

const connectDB = async () => {
  try {
    const pg = getPgPool();
    if (pg) {
      await pg.query('SELECT 1');
      if (!isConnected) {
        console.log('✅ Neon Cloud PostgreSQL Database connected successfully');
        isConnected = true;
      }
    } else {
      const db = getDatabase();
      if (!isConnected) {
        console.log(`✅ SQLite Database connected successfully: ${getDbPath()}`);
        isConnected = true;
      }
    }

    try {
      const mongoose = require('mongoose');
      mongoose.connection.readyState = 1;
    } catch (_) {}
    return true;
  } catch (error) {
    console.warn(`Database connection notice: ${error.message}`);
    try {
      const db = getDatabase();
      if (!isConnected) {
        console.log(`✅ SQLite Database connected: ${getDbPath()}`);
        isConnected = true;
      }
      const mongoose = require('mongoose');
      mongoose.connection.readyState = 1;
      return db;
    } catch (e2) {
      console.error(`Database connection error: ${e2.message}`);
      return false;
    }
  }
};

module.exports = connectDB;
