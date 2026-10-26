let Database = null;
try {
  Database = require('better-sqlite3');
} catch (e) {
  console.warn('better-sqlite3 native binary not available:', e.message);
}
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

let dbInstance = null;
let pgPoolInstance = null;

const NEON_PG_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || 'postgresql://neondb_owner:npg_W5eN8cwVzdZL@ep-cool-hat-b4oaun4s-pooler.c-6.us-east-2.aws.neon.tech/marketverse?sslmode=require';

function getPgPool() {
  if (!pgPoolInstance && NEON_PG_URL) {
    try {
      pgPoolInstance = new Pool({
        connectionString: NEON_PG_URL,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
      pgPoolInstance.on('error', (err) => {
        console.warn('PostgreSQL Pool idle error:', err.message);
      });
    } catch (e) {
      console.warn('Could not initialize PostgreSQL pool:', e.message);
      pgPoolInstance = null;
    }
  }
  return pgPoolInstance;
}

// Determine appropriate database path (uses local file or /tmp in serverless)
function getDbPath() {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (isServerless) {
    const tmpPath = path.join(os.tmpdir(), 'marketplace.sqlite');
    const localSeedDb = path.join(__dirname, '../marketplace.sqlite');
    if (!fs.existsSync(tmpPath) && fs.existsSync(localSeedDb)) {
      try {
        fs.copyFileSync(localSeedDb, tmpPath);
      } catch (e) {
        console.warn('Could not copy seed database to /tmp:', e.message);
      }
    }
    return tmpPath;
  }
  return path.join(__dirname, '../marketplace.sqlite');
}

function getDatabase() {
  if (!Database) return null;
  if (!dbInstance) {
    try {
      const dbPath = getDbPath();
      dbInstance = new Database(dbPath);
      dbInstance.pragma('journal_mode = WAL');
      dbInstance.pragma('foreign_keys = ON');
      initTables(dbInstance);
    } catch (e) {
      console.warn('SQLite initialization notice:', e.message);
      return null;
    }
  }
  return dbInstance;
}

function initTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      _id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE COLLATE NOCASE,
      password TEXT,
      role TEXT DEFAULT 'customer',
      phone TEXT,
      avatar TEXT,
      status TEXT DEFAULT 'active',
      isVerified INTEGER DEFAULT 1,
      passwordChangedAt TEXT,
      data TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

    CREATE TABLE IF NOT EXISTS categories (
      _id TEXT PRIMARY KEY,
      name TEXT,
      slug TEXT UNIQUE COLLATE NOCASE,
      description TEXT,
      commissionPercentage REAL DEFAULT 10,
      iconUrl TEXT,
      isActive INTEGER DEFAULT 1,
      data TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

    CREATE TABLE IF NOT EXISTS vendor_profiles (
      _id TEXT PRIMARY KEY,
      user TEXT,
      storeName TEXT UNIQUE COLLATE NOCASE,
      storeEmail TEXT,
      storePhone TEXT,
      description TEXT,
      logo TEXT,
      banner TEXT,
      commissionRate REAL DEFAULT 10,
      status TEXT DEFAULT 'pending',
      rating REAL DEFAULT 5.0,
      currentBalance REAL DEFAULT 0,
      totalSales INTEGER DEFAULT 0,
      data TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_vendors_user ON vendor_profiles(user);
    CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendor_profiles(status);

    CREATE TABLE IF NOT EXISTS products (
      _id TEXT PRIMARY KEY,
      vendor TEXT,
      vendorUser TEXT,
      category TEXT,
      title TEXT,
      slug TEXT UNIQUE COLLATE NOCASE,
      sku TEXT,
      description TEXT,
      brand TEXT,
      price REAL,
      salePrice REAL,
      stock INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      ratingsAverage REAL DEFAULT 4.5,
      ratingsQuantity INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      isApproved INTEGER DEFAULT 1,
      data TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor);
    CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
    CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

    CREATE TABLE IF NOT EXISTS coupons (
      _id TEXT PRIMARY KEY,
      code TEXT UNIQUE COLLATE NOCASE,
      discountType TEXT DEFAULT 'percentage',
      discountValue REAL,
      discountPercentage REAL,
      minOrderAmount REAL DEFAULT 0,
      maxDiscountAmount REAL,
      usageLimit INTEGER,
      usedCount INTEGER DEFAULT 0,
      expiresAt TEXT,
      expiryDate TEXT,
      isActive INTEGER DEFAULT 1,
      data TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

    CREATE TABLE IF NOT EXISTS orders (
      _id TEXT PRIMARY KEY,
      orderNumber TEXT UNIQUE,
      customer TEXT,
      grandTotal REAL,
      paymentStatus TEXT DEFAULT 'paid',
      orderStatus TEXT DEFAULT 'processing',
      data TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer);

    CREATE TABLE IF NOT EXISTS vendor_orders (
      _id TEXT PRIMARY KEY,
      masterOrder TEXT,
      vendor TEXT,
      subtotal REAL,
      commissionTotal REAL,
      vendorNetTotal REAL,
      fulfillmentStatus TEXT DEFAULT 'placed',
      data TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_vendor_orders_vendor ON vendor_orders(vendor);
    CREATE INDEX IF NOT EXISTS idx_vendor_orders_master ON vendor_orders(masterOrder);

    CREATE TABLE IF NOT EXISTS commission_ledgers (
      _id TEXT PRIMARY KEY,
      masterOrder TEXT,
      vendorOrder TEXT,
      vendor TEXT,
      platformCommissionFee REAL,
      vendorNetPayout REAL,
      payoutStatus TEXT DEFAULT 'pending',
      data TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS carts (
      _id TEXT PRIMARY KEY,
      user TEXT UNIQUE,
      data TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_carts_user ON carts(user);

    CREATE TABLE IF NOT EXISTS addresses (
      _id TEXT PRIMARY KEY,
      user TEXT,
      isDefault INTEGER DEFAULT 0,
      data TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user);

    CREATE TABLE IF NOT EXISTS reviews (
      _id TEXT PRIMARY KEY,
      product TEXT,
      user TEXT,
      rating REAL DEFAULT 5,
      comment TEXT,
      data TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product);
  `);

  // Auto-seed initial baseline records if SQLite database is completely fresh
  try {
    const userCount = db.prepare('SELECT count(*) as cnt FROM users').get().cnt;
    if (userCount === 0) {
      const fallbackData = require('../utils/fallbackData');
      const now = new Date().toISOString();

      // Seed Users
      const insertUser = db.prepare(`
        INSERT OR IGNORE INTO users (_id, name, email, password, role, phone, avatar, status, isVerified, data, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const u of fallbackData.users) {
        const hashedPassword = u.password.startsWith('$2') ? u.password : bcrypt.hashSync(u.password, 10);
        const dataJson = JSON.stringify({ ...u, password: hashedPassword, createdAt: now, updatedAt: now });
        insertUser.run(
          String(u._id),
          u.name,
          u.email,
          hashedPassword,
          u.role || 'customer',
          u.phone || '',
          u.avatar || '',
          u.status || 'active',
          1,
          dataJson,
          now,
          now
        );
      }

      // Seed Categories
      const insertCat = db.prepare(`
        INSERT OR IGNORE INTO categories (_id, name, slug, description, commissionPercentage, iconUrl, isActive, data, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const c of fallbackData.categories) {
        const dataJson = JSON.stringify({ ...c, isActive: true, createdAt: now, updatedAt: now });
        insertCat.run(
          String(c._id),
          c.name,
          c.slug,
          c.description || '',
          Number(c.commissionPercentage) || 10,
          c.iconUrl || '',
          1,
          dataJson,
          now,
          now
        );
      }

      // Seed Vendor Profiles
      const insertVendor = db.prepare(`
        INSERT OR IGNORE INTO vendor_profiles (_id, user, storeName, slug, storeDescription, status, rating, totalSales, totalOrders, commissionRate, data, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const v of fallbackData.vendorProfiles) {
        const dataJson = JSON.stringify({ ...v, createdAt: now, updatedAt: now });
        insertVendor.run(
          String(v._id),
          String(v.user),
          v.storeName,
          v.slug,
          v.storeDescription || '',
          v.status || 'approved',
          Number(v.rating) || 5,
          Number(v.totalSales) || 0,
          Number(v.totalOrders) || 0,
          Number(v.commissionRate) || 10,
          dataJson,
          now,
          now
        );
      }

      // Seed Products
      const insertProd = db.prepare(`
        INSERT OR IGNORE INTO products (_id, title, slug, description, category, vendor, brand, price, salePrice, stock, sku, images, featured, ratingsAverage, ratingsQuantity, isApproved, isActive, data, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of fallbackData.products) {
        const dataJson = JSON.stringify({ ...p, isApproved: true, isActive: true, createdAt: now, updatedAt: now });
        insertProd.run(
          String(p._id),
          p.title,
          p.slug || '',
          p.description || '',
          String(p.category),
          String(p.vendor),
          p.brand || '',
          Number(p.price) || 0,
          Number(p.salePrice) || Number(p.price) || 0,
          Number(p.stock) || 0,
          p.sku || '',
          JSON.stringify(p.images || []),
          p.featured ? 1 : 0,
          Number(p.ratingsAverage) || 4.5,
          Number(p.ratingsQuantity) || 1,
          1,
          1,
          dataJson,
          now,
          now
        );
      }

      // Seed Coupons
      const insertCoupon = db.prepare(`
        INSERT OR IGNORE INTO coupons (_id, code, discountType, discountValue, minOrderAmount, maxDiscountAmount, expirationDate, isActive, data, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const coup of (fallbackData.coupons || [])) {
        const dataJson = JSON.stringify({ ...coup, isActive: true, createdAt: now, updatedAt: now });
        insertCoupon.run(
          String(coup._id),
          coup.code,
          coup.discountType || 'percentage',
          Number(coup.discountValue) || 10,
          Number(coup.minOrderAmount) || 0,
          Number(coup.maxDiscountAmount) || 100,
          coup.expirationDate || '',
          1,
          dataJson,
          now,
          now
        );
      }
    }
  } catch (seedErr) {
    console.warn('Initial SQLite auto-seed notice:', seedErr.message);
  }
}

function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

// Model registry for cross-table populate
const modelRegistry = {};

class Document {
  constructor(data, model) {
    this._model = model;
    Object.assign(this, data);
    if (!this._id) {
      this._id = generateId();
    }
    this.id = this._id;
    if (this.isActive === undefined && (model.tableName === 'categories' || model.tableName === 'products' || model.tableName === 'coupons')) {
      this.isActive = true;
    }
    if (this.isApproved === undefined && model.tableName === 'products') {
      this.isApproved = true;
    }
    if (this.status === undefined && model.tableName === 'users') {
      this.status = 'active';
    }
  }

  isModified(field) {
    return true;
  }

  toObject() {
    const obj = { ...this };
    delete obj._model;
    return obj;
  }

  toJSON() {
    return this.toObject();
  }

  async save() {
    const db = getDatabase();
    const now = new Date().toISOString();
    if (!this.createdAt) this.createdAt = now;
    this.updatedAt = now;

    // User-specific password hashing
    if (this._model.tableName === 'users' && this.password) {
      if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
        this.password = bcrypt.hashSync(this.password, 12);
        this.passwordChangedAt = now;
      }
    }

    // Cart-specific calculate totals
    if (this._model.tableName === 'carts' && typeof this.calculateTotals === 'function') {
      this.calculateTotals();
    }

    const docObj = this.toObject();
    const dataJson = JSON.stringify(docObj);

    // Dynamic SQL upsert
    const keys = Object.keys(docObj).filter(k => k !== '_model' && k !== 'id');
    const cols = ['_id', 'data', 'createdAt', 'updatedAt'];
    const vals = [this._id, dataJson, this.createdAt, this.updatedAt];

    const specificFields = {
      users: ['name', 'email', 'password', 'role', 'phone', 'avatar', 'status', 'isVerified', 'passwordChangedAt'],
      categories: ['name', 'slug', 'description', 'commissionPercentage', 'iconUrl', 'isActive'],
      vendor_profiles: ['user', 'storeName', 'storeEmail', 'storePhone', 'description', 'logo', 'banner', 'commissionRate', 'status', 'rating', 'currentBalance', 'totalSales'],
      products: ['vendor', 'vendorUser', 'category', 'title', 'slug', 'sku', 'description', 'brand', 'price', 'salePrice', 'stock', 'featured', 'ratingsAverage', 'ratingsQuantity', 'isActive', 'isApproved'],
      coupons: ['code', 'discountType', 'discountValue', 'discountPercentage', 'minOrderAmount', 'maxDiscountAmount', 'usageLimit', 'usedCount', 'expiresAt', 'expiryDate', 'isActive'],
      orders: ['orderNumber', 'customer', 'grandTotal', 'paymentStatus', 'orderStatus'],
      vendor_orders: ['masterOrder', 'vendor', 'subtotal', 'commissionTotal', 'vendorNetTotal', 'fulfillmentStatus'],
      commission_ledgers: ['masterOrder', 'vendorOrder', 'vendor', 'platformCommissionFee', 'vendorNetPayout', 'payoutStatus'],
      carts: ['user'],
      addresses: ['user', 'isDefault'],
      reviews: ['product', 'user', 'rating', 'comment'],
    };

    const allowed = specificFields[this._model.tableName] || [];
    for (const f of allowed) {
      if (this[f] !== undefined) {
        cols.push(f);
        let val = this[f];
        if (typeof val === 'boolean') val = val ? 1 : 0;
        else if (typeof val === 'object' && val !== null && val._id) val = String(val._id);
        else if (typeof val === 'object' && val !== null && val.id) val = String(val.id);
        else if (val instanceof Date) val = val.toISOString();
        else if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
        else if (val === undefined) val = null;
        vals.push(val);
      }
    }

    const placeholders = cols.map(() => '?').join(', ');
    const updateClauses = cols.filter(c => c !== '_id').map(c => `${c} = excluded.${c}`).join(', ');

    const sql = `
      INSERT INTO ${this._model.tableName} (${cols.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT(_id) DO UPDATE SET ${updateClauses}
    `;

    const sanitizedVals = vals.map((v) => {
      if (v === undefined || v === null) return null;
      if (typeof v === 'boolean') return v ? 1 : 0;
      if (typeof v === 'number' || typeof v === 'bigint') return v;
      if (v instanceof Date) return v.toISOString();
      if (typeof v === 'object') return JSON.stringify(v);
      return String(v);
    });

    if (db) {
      try {
        db.prepare(sql).run(...sanitizedVals);
      } catch (sqliteErr) {
        console.warn('SQLite save notice:', sqliteErr.message);
      }
    }

    // Persist to Neon PostgreSQL for permanent cloud storage
    const pg = getPgPool();
    if (pg) {
      try {
        const pgCols = cols.map(c => `"${c}"`).join(', ');
        const pgPlaceholders = cols.map((_, i) => `$${i + 1}`).join(', ');
        const pgUpdate = cols.filter(c => c !== '_id').map(c => `"${c}" = EXCLUDED."${c}"`).join(', ');
        const pgSql = `
          INSERT INTO ${this._model.tableName} (${pgCols})
          VALUES (${pgPlaceholders})
          ON CONFLICT (_id) DO UPDATE SET ${pgUpdate}
        `;
        await pg.query(pgSql, sanitizedVals);
      } catch (pgErr) {
        console.warn('PostgreSQL save notice:', pgErr.message);
      }
    }

    return this;
  }
}

Document.prototype.correctPassword = async function (candidatePassword, userPassword) {
  const hash = userPassword || this.password;
  if (!hash || !candidatePassword) return false;
  if (hash === candidatePassword) return true;
  try {
    return await bcrypt.compare(candidatePassword, hash);
  } catch (e) {
    return false;
  }
};

Document.prototype.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(new Date(this.passwordChangedAt).getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Cart-specific instance methods
Document.prototype.calculateTotals = function () {
  const items = this.items || [];
  this.subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

  let discount = 0;
  if (this.appliedCoupon && this.appliedCoupon.code) {
    const val = Number(this.appliedCoupon.discountValue || this.appliedCoupon.discountPercentage) || 0;
    if (this.appliedCoupon.discountType === 'percentage' || this.appliedCoupon.discountPercentage) {
      discount = (this.subtotal * val) / 100;
    } else {
      discount = val;
    }
    if (this.appliedCoupon.maxDiscountAmount && discount > this.appliedCoupon.maxDiscountAmount) {
      discount = this.appliedCoupon.maxDiscountAmount;
    }
  }
  this.discountTotal = Math.min(discount, this.subtotal);
  this.grandTotal = Math.max(0, this.subtotal - this.discountTotal);
};

// Chainable query builder
class QueryChain {
  constructor(model, filter = {}, single = false) {
    this.model = model;
    this.filter = filter;
    this.isSingle = single;
    this._populates = [];
    this._sort = null;
    this._skip = 0;
    this._limit = null;
    this._select = null;
  }

  populate(pathOrObj, selectFields) {
    if (typeof pathOrObj === 'object') {
      this._populates.push(pathOrObj);
    } else {
      this._populates.push({ path: pathOrObj, select: selectFields });
    }
    return this;
  }

  sort(sortStr) {
    this._sort = sortStr;
    return this;
  }

  skip(n) {
    this._skip = Number(n) || 0;
    return this;
  }

  limit(n) {
    this._limit = Number(n);
    return this;
  }

  select(fields) {
    this._select = fields;
    return this;
  }

  async exec() {
    let rows = [];
    const pg = getPgPool();
    if (pg) {
      try {
        const res = await pg.query(`SELECT * FROM ${this.model.tableName}`);
        rows = res.rows;
      } catch (err) {
        console.warn('PostgreSQL query notice, falling back to local SQLite:', err.message);
        const db = getDatabase();
        if (db) rows = db.prepare(`SELECT * FROM ${this.model.tableName}`).all();
      }
    } else {
      const db = getDatabase();
      if (db) rows = db.prepare(`SELECT * FROM ${this.model.tableName}`).all();
    }

    // In-memory filter matching data JSON
    let docs = rows.map(r => {
      let parsed = {};
      try {
        parsed = typeof r.data === 'string' ? JSON.parse(r.data) : (r.data || { ...r });
      } catch (e) {
        parsed = { ...r };
      }
      return new Document(parsed, this.model);
    });

    if (this.filter && Object.keys(this.filter).length > 0) {
      docs = docs.filter(doc => matchesFilter(doc, this.filter));
    }

    // Sorting
    if (this._sort) {
      let sortKey = this._sort;
      let descending = false;
      if (sortKey.startsWith('-')) {
        descending = true;
        sortKey = sortKey.substring(1);
      }
      docs.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];
        if (valA === undefined) valA = '';
        if (valB === undefined) valB = '';
        if (typeof valA === 'string' && (valA.includes('T') || !isNaN(Date.parse(valA)))) {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }
        if (valA < valB) return descending ? 1 : -1;
        if (valA > valB) return descending ? -1 : 1;
        return 0;
      });
    }

    // Skip & Limit
    if (this._skip > 0) {
      docs = docs.slice(this._skip);
    }
    if (this._limit !== null && !isNaN(this._limit)) {
      docs = docs.slice(0, this._limit);
    }

    // Populate
    for (const pop of this._populates) {
      docs = await executePopulate(docs, pop);
    }

    if (this.isSingle) {
      const singleDoc = docs.length > 0 ? docs[0] : null;
      if (singleDoc && this._select && !this._select.includes('+password') && this.model.tableName === 'users') {
        // Password omitted by default unless +password requested
        delete singleDoc.password;
      }
      return singleDoc;
    }

    // Hide password for user list
    if (this.model.tableName === 'users') {
      docs.forEach(d => { delete d.password; });
    }

    return docs;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

function matchesFilter(doc, filter) {
  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(val)) {
      const matchAny = val.some(subFilter => matchesFilter(doc, subFilter));
      if (!matchAny) return false;
      continue;
    }

    const docVal = doc[key];

    if (val && typeof val === 'object' && !(val instanceof RegExp)) {
      if (val.$regex) {
        const regex = new RegExp(val.$regex, val.$options || 'i');
        if (!regex.test(String(docVal || ''))) return false;
        continue;
      }
      if (val.$gte !== undefined && (docVal === undefined || docVal < val.$gte)) return false;
      if (val.$lte !== undefined && (docVal === undefined || docVal > val.$lte)) return false;
      if (val.$gt !== undefined && (docVal === undefined || docVal <= val.$gt)) return false;
      if (val.$lt !== undefined && (docVal === undefined || docVal >= val.$lt)) return false;
      if (val.$ne !== undefined && docVal === val.$ne) return false;
      if (val.$in !== undefined && (!Array.isArray(val.$in) || !val.$in.includes(docVal))) return false;
      continue;
    }

    if (val instanceof RegExp) {
      if (!val.test(String(docVal || ''))) return false;
      continue;
    }

    // Boolean normalization for SQLite 1/0 flags
    if (typeof val === 'boolean') {
      const boolDocVal = (docVal === 1 || docVal === '1' || docVal === 'true' || docVal === true);
      const effectiveVal = (docVal === undefined && (key === 'isActive' || key === 'isApproved' || key === 'isVerified')) ? true : boolDocVal;
      if (effectiveVal !== val) return false;
      continue;
    }

    // Case-insensitive trimmed matching for email, slug, and code
    if (key === 'email' || key === 'slug' || key === 'code') {
      if (String(docVal || '').trim().toLowerCase() !== String(val || '').trim().toLowerCase()) {
        return false;
      }
      continue;
    }

    if (docVal !== val && String(docVal) !== String(val)) {
      // Check if ObjectId reference equality
      if (docVal && typeof docVal === 'object' && docVal._id && String(docVal._id) === String(val)) {
        continue;
      }
      return false;
    }
  }
  return true;
}

async function executePopulate(docs, pop) {
  const { path: popPath, select, populate: subPop } = pop;
  for (const doc of docs) {
    if (popPath.includes('.')) {
      const parts = popPath.split('.');
      if (parts[0] === 'items' && Array.isArray(doc.items)) {
        for (const item of doc.items) {
          const targetId = item[parts[1]]?._id || item[parts[1]];
          if (targetId) {
            const targetModel = parts[1] === 'product' ? modelRegistry['Product'] : modelRegistry['VendorProfile'];
            if (targetModel) {
              let refDoc = await targetModel.findById(targetId);
              if (refDoc && select) refDoc = projectFields(refDoc, select);
              item[parts[1]] = refDoc;
            }
          }
        }
      }
      continue;
    }

    const targetVal = doc[popPath];
    if (!targetVal) continue;

    // Direct relation resolution
    let targetModel = null;
    if (popPath === 'vendor' || popPath === 'vendorProfile') targetModel = modelRegistry['VendorProfile'];
    else if (popPath === 'category') targetModel = modelRegistry['Category'];
    else if (popPath === 'user' || popPath === 'customer' || popPath === 'vendorUser') targetModel = modelRegistry['User'];
    else if (popPath === 'vendorOrders') targetModel = modelRegistry['VendorOrder'];
    else if (popPath === 'product') targetModel = modelRegistry['Product'];
    else if (popPath === 'order' || popPath === 'masterOrder') targetModel = modelRegistry['Order'];

    if (!targetModel) continue;

    if (Array.isArray(targetVal)) {
      const populatedArray = [];
      for (const idOrObj of targetVal) {
        const id = idOrObj._id || idOrObj;
        let refDoc = await targetModel.findById(id);
        if (refDoc && subPop) {
          refDoc = (await executePopulate([refDoc], subPop))[0];
        }
        if (refDoc && select) refDoc = projectFields(refDoc, select);
        if (refDoc) populatedArray.push(refDoc);
      }
      doc[popPath] = populatedArray;
    } else {
      const id = targetVal._id || targetVal;
      let refDoc = await targetModel.findById(id);
      if (refDoc && subPop) {
        refDoc = (await executePopulate([refDoc], subPop))[0];
      }
      if (refDoc && select) refDoc = projectFields(refDoc, select);
      if (refDoc) doc[popPath] = refDoc;
    }
  }
  return docs;
}

function projectFields(doc, select) {
  if (!select) return doc;
  const fields = select.split(' ').filter(Boolean);
  const projected = { _id: doc._id, id: doc.id };
  fields.forEach(f => {
    if (doc[f] !== undefined) projected[f] = doc[f];
  });
  return projected;
}

function createModel(modelName, tableName) {
  const model = {
    modelName,
    tableName,

    find(filter = {}) {
      return new QueryChain(this, filter, false);
    },

    findOne(filter = {}) {
      return new QueryChain(this, filter, true);
    },

    findById(id) {
      const cleanId = id?._id || id;
      return new QueryChain(this, { _id: String(cleanId) }, true);
    },

    async create(data) {
      if (Array.isArray(data)) {
        const created = [];
        for (const item of data) {
          const doc = new Document(item, this);
          await doc.save();
          created.push(doc);
        }
        return created;
      }
      const doc = new Document(data, this);
      await doc.save();
      return doc;
    },

    async findByIdAndUpdate(id, update, options = {}) {
      const doc = await this.findById(id);
      if (!doc) return null;

      if (update.$inc) {
        for (const [k, v] of Object.entries(update.$inc)) {
          doc[k] = (Number(doc[k]) || 0) + Number(v);
        }
      }

      for (const [k, v] of Object.entries(update)) {
        if (k !== '$inc' && k !== '$set') {
          doc[k] = v;
        } else if (k === '$set') {
          Object.assign(doc, v);
        }
      }

      await doc.save();
      return doc;
    },

    async findOneAndUpdate(filter, update, options = {}) {
      const doc = await this.findOne(filter);
      if (!doc) return null;
      return this.findByIdAndUpdate(doc._id, update, options);
    },

    async findByIdAndDelete(id) {
      const db = getDatabase();
      const cleanId = id?._id || id;
      const doc = await this.findById(cleanId);
      if (doc) {
        if (db) {
          try {
            db.prepare(`DELETE FROM ${this.tableName} WHERE _id = ?`).run(String(cleanId));
          } catch (_) {}
        }
        const pg = getPgPool();
        if (pg) {
          try {
            await pg.query(`DELETE FROM ${this.tableName} WHERE _id = $1`, [String(cleanId)]);
          } catch (_) {}
        }
      }
      return doc;
    },

    async findOneAndDelete(filter) {
      const doc = await this.findOne(filter);
      if (doc) {
        return this.findByIdAndDelete(doc._id);
      }
      return null;
    },

    async deleteMany(filter = {}) {
      const db = getDatabase();
      const pg = getPgPool();
      if (!filter || Object.keys(filter).length === 0) {
        if (db) {
          try {
            db.prepare(`DELETE FROM ${this.tableName}`).run();
          } catch (_) {}
        }
        if (pg) {
          try {
            await pg.query(`DELETE FROM ${this.tableName}`);
          } catch (_) {}
        }
        return { deletedCount: 0 };
      }
      const docs = await this.find(filter);
      for (const d of docs) {
        if (db) {
          try {
            db.prepare(`DELETE FROM ${this.tableName} WHERE _id = ?`).run(d._id);
          } catch (_) {}
        }
        if (pg) {
          try {
            await pg.query(`DELETE FROM ${this.tableName} WHERE _id = $1`, [d._id]);
          } catch (_) {}
        }
      }
      return { deletedCount: docs.length };
    },

    async countDocuments(filter = {}) {
      const docs = await this.find(filter);
      return docs.length;
    },
  };

  modelRegistry[modelName] = model;
  return model;
}

// Instantiate and export all models
const User = createModel('User', 'users');
const Category = createModel('Category', 'categories');
const VendorProfile = createModel('VendorProfile', 'vendor_profiles');
const Product = createModel('Product', 'products');
const Coupon = createModel('Coupon', 'coupons');
const Order = createModel('Order', 'orders');
const VendorOrder = createModel('VendorOrder', 'vendor_orders');
const CommissionLedger = createModel('CommissionLedger', 'commission_ledgers');
const Cart = createModel('Cart', 'carts');
const Address = createModel('Address', 'addresses');
const Review = createModel('Review', 'reviews');

module.exports = {
  getDatabase,
  getDbPath,
  getPgPool,
  User,
  Category,
  VendorProfile,
  Product,
  Coupon,
  Order,
  VendorOrder,
  CommissionLedger,
  Cart,
  Address,
  Review,
};
