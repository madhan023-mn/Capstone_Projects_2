const express = require('express');
const mongoose = require('mongoose');
const { getDatabase, getPgPool } = require('../config/sqlite');
const { isRedisConnected } = require('../config/redis');
const { isElasticsearchConnected } = require('../config/elasticsearch');

const router = express.Router();

router.get('/health', (req, res) => {
  let dbStatus = 'disconnected';
  let activeEngine = 'none';

  if (mongoose.connection && mongoose.connection.readyState === 1) {
    dbStatus = 'connected';
    activeEngine = `MongoDB Atlas (${mongoose.connection.host || 'cloud'})`;
  } else {
    try {
      const pg = getPgPool();
      if (pg) {
        dbStatus = 'connected';
        activeEngine = 'Neon Cloud PostgreSQL';
      } else {
        const db = getDatabase();
        if (db) {
          db.prepare('SELECT 1').get();
          dbStatus = 'connected';
          activeEngine = 'SQLite';
        }
      }
    } catch (e) {
      dbStatus = 'disconnected';
    }
  }

  const redisStatus = isRedisConnected() ? 'connected' : 'in-memory-fallback';
  const esStatus = isElasticsearchConnected() ? 'connected' : 'database-search';

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      engine: activeEngine,
      redis: redisStatus,
      elasticsearch: esStatus,
    },
    version: '1.0.0',
    platform: `Multi-Vendor Marketplace API (${activeEngine})`,
  });
});

module.exports = router;
