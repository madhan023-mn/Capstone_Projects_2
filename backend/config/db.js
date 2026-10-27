const mongoose = require('mongoose');
const { getDatabase, getDbPath, getPgPool } = require('./sqlite');

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let isConnected = false;
let lastMongoAttempt = 0;
const MONGO_RETRY_INTERVAL = 60000;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  // 1. Prioritize MongoDB Atlas if MONGO_URI is set
  if (mongoUri && !mongoUri.includes('127.0.0.1')) {
    if (cached.conn && mongoose.connection.readyState === 1) {
      return cached.conn;
    }

    const canAttemptMongo = (Date.now() - lastMongoAttempt) > MONGO_RETRY_INTERVAL;

    if (!cached.promise && canAttemptMongo) {
      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      };

      cached.promise = mongoose
        .connect(mongoUri, opts)
        .then((m) => {
          console.log(`✅ MongoDB Atlas connected successfully: ${m.connection.host}/${m.connection.name}`);
          isConnected = true;
          return m;
        })
        .catch((err) => {
          lastMongoAttempt = Date.now();
          cached.promise = null;
          console.warn(`⚠️ MongoDB Atlas connection error: ${err.message}. Attempting SQLite/Postgres fallback...`);
          return null;
        });
    }

    if (cached.promise) {
      const conn = await cached.promise;
      if (conn && mongoose.connection.readyState === 1) {
        return conn;
      }
    }
  }

  // If already connected to fallback, return immediately without re-querying
  if (isConnected) {
    return true;
  }

  // 2. Fallback to Cloud PostgreSQL (Neon) or SQLite
  try {
    const pg = getPgPool();
    if (pg) {
      await pg.query('SELECT 1');
      if (!isConnected) {
        console.log('✅ Neon Cloud PostgreSQL Database connected successfully');
        isConnected = true;
      }
      return true;
    } else {
      const db = getDatabase();
      if (!isConnected) {
        console.log(`✅ SQLite Database connected successfully: ${getDbPath()}`);
        isConnected = true;
      }
      return db;
    }
  } catch (error) {
    console.warn(`Database connection notice: ${error.message}`);
    try {
      const db = getDatabase();
      if (!isConnected) {
        console.log(`✅ SQLite Database connected: ${getDbPath()}`);
        isConnected = true;
      }
      return db;
    } catch (e2) {
      console.error(`Database connection error: ${e2.message}`);
      return false;
    }
  }
};

module.exports = connectDB;
