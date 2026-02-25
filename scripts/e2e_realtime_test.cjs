#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

async function run() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  if (!url || !key) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_KEY are required');
    process.exit(2);
  }

  const supabase = createClient(url, key, { realtime: { params: { eventsPerSecond: 10 } } });

  const testRef = `e2e-${Date.now()}`;
  let userId = process.env.TEST_USER_ID || null;
  if (!userId) {
    console.log('No TEST_USER_ID provided — creating a test user via Supabase admin API');
    const tempEmail = `e2e-test-${Date.now()}@example.com`;
    const tempPass = `T3st!${Math.random().toString(36).slice(2,10)}`;
    try {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({ email: tempEmail, password: tempPass, email_confirm: true });
      if (createErr) {
        console.error('Failed to create test user', createErr);
        process.exit(1);
      }
      userId = created.id;
      console.log('Created test user', userId, tempEmail);
    } catch (e) {
      console.error('Exception creating test user', e);
      process.exit(1);
    }
  }

  console.log('Subscribing to transactions changes...');
  const sub = supabase.channel('public:transactions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, payload => {
      console.log('Realtime event:', payload.eventType, payload.record && payload.record.id, payload.record && payload.record.status);
    })
    .subscribe((status) => console.log('Subscription status:', status));

  console.log('Inserting test transaction (REQUESTED)...');
  const insertPayload = {
    user_id: userId,
    type: 'DEPOSIT',
    amount: 500,
    currency: 'USD',
    reference: testRef,
    status: 'REQUESTED',
    metadata: { test: true }
  };

  const { data: inserted, error: insertErr } = await supabase.from('transactions').insert(insertPayload).select().single();
  if (insertErr) { console.error('Insert error', insertErr); process.exit(1); }
  console.log('Inserted txn id', inserted.id);

  console.log('Calling RPC process_transaction_update to COMPLETE and adjust balance...');
  const rpcParams = { p_txn_id: inserted.id, p_new_status: 'COMPLETED', p_processed_by: null, p_metadata: { automated_test: true } };
  const { error: rpcErr } = await supabase.rpc('process_transaction_update', rpcParams);
  if (rpcErr) { console.error('RPC error', rpcErr); process.exit(1); }
  console.log('RPC called successfully');

  const { data: txnAfter, error: fetchErr } = await supabase.from('transactions').select('*').eq('id', inserted.id).single();
  if (fetchErr) { console.error('Fetch txn error', fetchErr); process.exit(1); }
  console.log('Final txn status:', txnAfter.status, 'balance_after:', txnAfter.balance_after);

  const { data: audits } = await supabase.from('transaction_audit').select('*').eq('transaction_id', inserted.id).order('created_at', { ascending: false }).limit(5);
  console.log('Audit entries:', audits && audits.length);

  await supabase.removeChannel(sub);
  console.log('E2E test completed');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
