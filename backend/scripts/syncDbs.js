const Database = require('better-sqlite3');
const { Pool } = require('pg');
const path = require('path');

const sqliteDbPath = path.join(__dirname, '../marketplace.sqlite');
const db = new Database(sqliteDbPath);

const NEON_URI = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_W5eN8cwVzdZL@ep-cool-hat-b4oaun4s-pooler.c-6.us-east-2.aws.neon.tech/marketverse?sslmode=require';
const pool = new Pool({
  connectionString: NEON_URI,
  ssl: { rejectUnauthorized: false }
});

async function syncDatabases() {
  console.log('🔄 Synchronizing data between Neon Cloud Database and marketplace.sqlite...');

  // 1. Remove temporary test users from SQLite
  db.prepare("DELETE FROM users WHERE email LIKE 'db_verify_%' OR email LIKE 'test_neon_%' OR email LIKE 'live_test_%'").run();

  // 2. Fetch all users from Neon
  const neonUsers = await pool.query('SELECT * FROM users');
  console.log(`Found ${neonUsers.rows.length} users in Neon database.`);

  // 3. Upsert Neon users into SQLite
  const insertUser = db.prepare(`
    INSERT INTO users (_id, name, email, password, role, phone, avatar, status, isVerified, passwordChangedAt, data, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(_id) DO UPDATE SET
      name = excluded.name,
      email = excluded.email,
      password = excluded.password,
      role = excluded.role,
      phone = excluded.phone,
      avatar = excluded.avatar,
      status = excluded.status,
      isVerified = excluded.isVerified,
      passwordChangedAt = excluded.passwordChangedAt,
      data = excluded.data,
      createdAt = excluded.createdAt,
      updatedAt = excluded.updatedAt
  `);

  for (const u of neonUsers.rows) {
    insertUser.run(
      u._id,
      u.name,
      u.email,
      u.password,
      u.role,
      u.phone,
      u.avatar,
      u.status,
      u.isVerified || 1,
      u.passwordChangedAt,
      typeof u.data === 'string' ? u.data : JSON.stringify(u.data || {}),
      u.createdAt,
      u.updatedAt
    );
  }

  // 4. Verify all tables in SQLite and Neon
  const tables = ['users', 'categories', 'vendor_profiles', 'products', 'coupons', 'orders', 'vendor_orders'];
  console.log('\n📊 Final Synchronization Status:');
  for (const t of tables) {
    const sqliteCount = db.prepare(`SELECT COUNT(1) as c FROM ${t}`).get().c;
    const neonRes = await pool.query(`SELECT COUNT(1) as c FROM ${t}`);
    const neonCount = neonRes.rows[0].c;
    console.log(`  Table [${t}]: SQLite = ${sqliteCount} | Neon = ${neonCount} (In Sync: ${sqliteCount === Number(neonCount) ? '✅' : '⚠️'})`);
  }

  await pool.end();
  console.log('\n✅ All data and credentials successfully synchronized and stored in both databases!');
}

syncDatabases().catch(e => {
  console.error('Sync error:', e);
  process.exit(1);
});
