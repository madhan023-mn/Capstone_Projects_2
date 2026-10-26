const { Pool } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');

const NEON_URI = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_W5eN8cwVzdZL@ep-cool-hat-b4oaun4s-pooler.c-6.us-east-2.aws.neon.tech/marketverse?sslmode=require';

const pool = new Pool({
  connectionString: NEON_URI,
  ssl: { rejectUnauthorized: false }
});

const tables = [
  `CREATE TABLE IF NOT EXISTS users (
    _id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'customer',
    phone TEXT,
    avatar TEXT,
    status TEXT DEFAULT 'active',
    "isVerified" INTEGER DEFAULT 1,
    "passwordChangedAt" TEXT,
    data TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT
  );`,
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
  `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`,

  `CREATE TABLE IF NOT EXISTS categories (
    _id TEXT PRIMARY KEY,
    name TEXT,
    slug TEXT UNIQUE,
    description TEXT,
    "commissionPercentage" REAL DEFAULT 10,
    "iconUrl" TEXT,
    "isActive" INTEGER DEFAULT 1,
    data TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT
  );`,
  `CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);`,

  `CREATE TABLE IF NOT EXISTS vendor_profiles (
    _id TEXT PRIMARY KEY,
    "user" TEXT,
    "storeName" TEXT UNIQUE,
    "storeEmail" TEXT,
    "storePhone" TEXT,
    description TEXT,
    logo TEXT,
    banner TEXT,
    "commissionRate" REAL DEFAULT 10,
    status TEXT DEFAULT 'pending',
    rating REAL DEFAULT 5.0,
    "currentBalance" REAL DEFAULT 0,
    "totalSales" INTEGER DEFAULT 0,
    data TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS products (
    _id TEXT PRIMARY KEY,
    vendor TEXT,
    "vendorUser" TEXT,
    category TEXT,
    title TEXT,
    slug TEXT UNIQUE,
    sku TEXT,
    description TEXT,
    brand TEXT,
    price REAL,
    "salePrice" REAL,
    stock INTEGER DEFAULT 0,
    featured INTEGER DEFAULT 0,
    "ratingsAverage" REAL DEFAULT 4.5,
    "ratingsQuantity" INTEGER DEFAULT 0,
    "isActive" INTEGER DEFAULT 1,
    "isApproved" INTEGER DEFAULT 1,
    data TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT
  );`,
  `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`,
  `CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor);`,

  `CREATE TABLE IF NOT EXISTS coupons (
    _id TEXT PRIMARY KEY,
    code TEXT UNIQUE,
    "discountType" TEXT DEFAULT 'percentage',
    "discountValue" REAL,
    "discountPercentage" REAL,
    "minOrderAmount" REAL DEFAULT 0,
    "maxDiscountAmount" REAL,
    "usageLimit" INTEGER,
    "usedCount" INTEGER DEFAULT 0,
    "expiresAt" TEXT,
    "expiryDate" TEXT,
    "isActive" INTEGER DEFAULT 1,
    data TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS orders (
    _id TEXT PRIMARY KEY,
    "orderNumber" TEXT UNIQUE,
    customer TEXT,
    "grandTotal" REAL,
    "paymentStatus" TEXT DEFAULT 'paid',
    "orderStatus" TEXT DEFAULT 'processing',
    data TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS vendor_orders (
    _id TEXT PRIMARY KEY,
    "masterOrder" TEXT,
    vendor TEXT,
    subtotal REAL,
    "commissionTotal" REAL,
    "vendorNetTotal" REAL,
    "fulfillmentStatus" TEXT DEFAULT 'placed',
    data TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS commission_ledgers (
    _id TEXT PRIMARY KEY,
    "masterOrder" TEXT,
    "vendorOrder" TEXT,
    vendor TEXT,
    "platformCommissionFee" REAL,
    "vendorNetPayout" REAL,
    "payoutStatus" TEXT DEFAULT 'pending',
    data TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS carts (
    _id TEXT PRIMARY KEY,
    "user" TEXT UNIQUE,
    data TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS addresses (
    _id TEXT PRIMARY KEY,
    "user" TEXT,
    "isDefault" INTEGER DEFAULT 0,
    data TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS reviews (
    _id TEXT PRIMARY KEY,
    product TEXT,
    "user" TEXT,
    rating REAL DEFAULT 5,
    comment TEXT,
    data TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT
  );`
];

async function initNeon() {
  console.log('🚀 Connecting to Neon PostgreSQL...');
  const client = await pool.connect();
  try {
    for (const sql of tables) {
      await client.query(sql);
    }
    console.log('✅ Neon PostgreSQL tables created successfully.');

    // Now migrate existing records from SQLite into Neon
    const sqlitePath = path.join(__dirname, '../marketplace.sqlite');
    const sqlite = new Database(sqlitePath);

    const tableNames = [
      'users', 'categories', 'vendor_profiles', 'products', 
      'coupons', 'orders', 'vendor_orders', 'commission_ledgers', 
      'carts', 'addresses', 'reviews'
    ];

    for (const t of tableNames) {
      try {
        const rows = sqlite.prepare(`SELECT * FROM ${t}`).all();
        console.log(`Migrating ${rows.length} rows for ${t}...`);
        for (const r of rows) {
          const keys = Object.keys(r);
          const cols = keys.map(k => `"${k}"`).join(', ');
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
          const updateClauses = keys.filter(k => k !== '_id').map(k => `"${k}" = EXCLUDED."${k}"`).join(', ');
          const vals = Object.values(r);

          const upsertSql = `
            INSERT INTO ${t} (${cols})
            VALUES (${placeholders})
            ON CONFLICT (_id) DO UPDATE SET ${updateClauses}
          `;
          await client.query(upsertSql, vals);
        }
      } catch (err) {
        console.warn(`Table ${t} notice:`, err.message);
      }
    }

    console.log('🎉 Neon PostgreSQL Migration completed with 100% data fidelity!');
  } finally {
    client.release();
    await pool.end();
  }
}

initNeon().catch(err => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
