const mongoose = require('mongoose');

/**
 * Creates a smart hybrid model proxy that delegates to Mongoose model when
 * connected to MongoDB, or gracefully falls back to SQLite/Cloud Postgres adapter.
 */
function createHybridModel(mongoModel, sqliteModelName) {
  let sqliteModel = null;
  function getSqlite() {
    if (!sqliteModel) {
      try {
        const sqliteModule = require('../config/sqlite');
        sqliteModel = sqliteModule[sqliteModelName];
      } catch (_) {}
    }
    return sqliteModel;
  }

  function isMongoActive() {
    return Boolean(mongoose.connection && mongoose.connection.readyState === 1 && mongoose.connection.host);
  }

  const handler = {
    get(target, prop, receiver) {
      if (isMongoActive()) {
        return Reflect.get(target, prop, receiver);
      }
      const sql = getSqlite();
      if (sql && prop in sql) {
        const val = sql[prop];
        return typeof val === 'function' ? val.bind(sql) : val;
      }
      return Reflect.get(target, prop, receiver);
    },
    apply(target, thisArg, argArray) {
      if (isMongoActive()) {
        return Reflect.apply(target, thisArg, argArray);
      }
      const sql = getSqlite();
      if (typeof sql === 'function') {
        return Reflect.apply(sql, thisArg, argArray);
      }
      return Reflect.apply(target, thisArg, argArray);
    },
    construct(target, argArray, newTarget) {
      if (isMongoActive()) {
        return Reflect.construct(target, argArray, newTarget);
      }
      const sql = getSqlite();
      if (typeof sql === 'function') {
        return Reflect.construct(sql, argArray, newTarget);
      }
      return Reflect.construct(target, argArray, newTarget);
    },
  };

  return new Proxy(mongoModel, handler);
}

module.exports = createHybridModel;
