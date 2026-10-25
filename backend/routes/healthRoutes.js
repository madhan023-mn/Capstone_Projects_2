const express = require('express');
const { getDatabase } = require('../config/sqlite');
const { isRedisConnected } = require('../config/redis');
const { isElasticsearchConnected } = require('../config/elasticsearch');

const router = express.Router();

router.get('/health', (req, res) => {
  let sqliteStatus = 'connected';
  try {
    getDatabase().prepare('SELECT 1').get();
  } catch (e) {
    sqliteStatus = 'disconnected';
  }
  const redisStatus = isRedisConnected() ? 'connected' : 'in-memory-fallback';
  const esStatus = isElasticsearchConnected() ? 'connected' : 'sqlite-search';

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      sqlite: sqliteStatus,
      redis: redisStatus,
      elasticsearch: esStatus,
    },
    version: '1.0.0',
    platform: 'Multi-Vendor Marketplace API (SQLite Engine)'
  });
});

module.exports = router;
