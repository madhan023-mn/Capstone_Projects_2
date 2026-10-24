const express = require('express');
const mongoose = require('mongoose');
const { isRedisConnected } = require('../config/redis');
const { isElasticsearchConnected } = require('../config/elasticsearch');

const router = express.Router();

router.get('/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redisStatus = isRedisConnected() ? 'connected' : 'in-memory-fallback';
  const esStatus = isElasticsearchConnected() ? 'connected' : 'mongo-text-fallback';

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoStatus,
      redis: redisStatus,
      elasticsearch: esStatus,
    },
    version: '1.0.0',
    platform: 'Multi-Vendor Marketplace API'
  });
});

module.exports = router;
