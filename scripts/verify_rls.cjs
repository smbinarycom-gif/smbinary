#!/usr/bin/env node
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
    const res1 = await client.query("SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('transactions','users')");
    console.log('RLS enabled?');
    res1.rows.forEach(r => console.log(r.relname, r.relrowsecurity));

    const res2 = await client.query("SELECT schemaname, tablename, policyname, permissive, roles, cmd FROM pg_policies WHERE tablename IN ('transactions','users') ORDER BY tablename");
    console.log('\nPolicies:');
    res2.rows.forEach(r => console.log(r.tablename, r.policyname, r.cmd, r.roles || 'all'));

    const res3 = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'transactions' ORDER BY ordinal_position");
    console.log('\ntransactions columns:');
    res3.rows.forEach(r => console.log(r.column_name, r.data_type));

    process.exit(0);
  } catch (e) {
    console.error('verify_rls error', e.message || e);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
