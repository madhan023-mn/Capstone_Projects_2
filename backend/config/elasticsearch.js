const { Client } = require('@elastic/elasticsearch');

let esClient = null;
let isElasticsearchConnected = false;

const initElasticsearch = async () => {
  const node = process.env.ELASTICSEARCH_NODE || 'http://127.0.0.1:9200';
  try {
    const client = new Client({
      node,
      maxRetries: 1,
      requestTimeout: 2000,
    });

    const ping = await client.ping();
    if (ping) {
      esClient = client;
      isElasticsearchConnected = true;
      console.log('✅ Connected to Elasticsearch node');
      return esClient;
    }
  } catch (error) {
    console.log('ℹ️ Elasticsearch node unavailable. Activated native MongoDB Search fallback.');
    isElasticsearchConnected = false;
  }
  return null;
};

const getElasticsearchClient = () => esClient;

module.exports = {
  initElasticsearch,
  getElasticsearchClient,
  isElasticsearchConnected: () => isElasticsearchConnected,
};
