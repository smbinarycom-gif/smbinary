#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is required');
    process.exit(2);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const migrations = ['migrations/0001_create_transactions.sql', 'migrations/0002_process_transaction.sql', 'migrations/0003_rls_policies.sql'];
    for (const m of migrations) {
      const p = path.join(process.cwd(), m);
      if (!fs.existsSync(p)) {
        console.warn('Skipping missing migration', m);
        continue;
      }
      const sql = fs.readFileSync(p, 'utf8');
      console.log('Applying', m);
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log('Applied', m);
    }
    console.log('All migrations applied');
  } catch (e) {
    console.error('Migration error', e.message || e);
    try { await client.query('ROLLBACK'); } catch (e2) {}
    process.exit(1);
  } finally {
    await client.end();
  }
}

run().catch(err => { console.error(err); process.exit(1); });
