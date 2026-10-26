const Database = require('better-sqlite3');
const { Pool } = require('pg');
const path = require('path');

const sqliteDbPath = path.join(__dirname, '../marketplace.sqlite');
console.log('Opening SQLite database at:', sqliteDbPath);
const db = new Database(sqliteDbPath);

const NEON_URI = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_W5eN8cwVzdZL@ep-cool-hat-b4oaun4s-pooler.c-6.us-east-2.aws.neon.tech/marketverse?sslmode=require';
const pool = new Pool({
  connectionString: NEON_URI,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  console.log('Tables found in marketplace.sqlite:');
  for (const t of tables) {
    const rowCount = db.prepare(`SELECT COUNT(1) as c FROM ${t.name}`).get().c;
    console.log(`  Table ${t.name}: ${rowCount} records in SQLite`);
  }

  console.log('\nUsers in marketplace.sqlite:');
  const users = db.prepare('SELECT _id, name, email, role, password FROM users').all();
  for (const u of users) {
    console.log(`  User: ${u.email} | Name: ${u.name} | Role: ${u.role} | PasswordHash: ${u.password ? u.password.substring(0, 15) + '...' : 'NONE'}`);
  }

  console.log('\nChecking Neon Cloud PostgreSQL tables & credentials:');
  for (const t of tables) {
    try {
      const res = await pool.query(`SELECT COUNT(1) as c FROM ${t.name}`);
      console.log(`  Neon ${t.name}: ${res.rows[0].c} records in Neon`);
    } catch (e) {
      console.log(`  Neon ${t.name}: Error - ${e.message}`);
    }
  }

  console.log('\nUsers in Neon PostgreSQL:');
  const neonUsers = await pool.query('SELECT _id, name, email, role, password FROM users');
  for (const nu of neonUsers.rows) {
    console.log(`  Neon User: ${nu.email} | Name: ${nu.name} | Role: ${nu.role} | PasswordHash: ${nu.password ? nu.password.substring(0, 15) + '...' : 'NONE'}`);
  }

  await pool.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
