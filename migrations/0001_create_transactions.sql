-- Migration: 0001_create_transactions.sql
-- Creates transactions ledger, audit table, triggers and basic RLS policies

/*
  Notes:
  - This migration is written for Postgres/Supabase.
  - Adjust jwt.claims.role checks to match your project's JWT claim names if different.
  - Service role (Supabase service key) bypasses RLS; use server-side code to perform privileged updates.
*/

-- 1) Create enum types
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'txn_type') THEN
    CREATE TYPE public.txn_type AS ENUM ('DEPOSIT','WITHDRAWAL');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'txn_status') THEN
    CREATE TYPE public.txn_status AS ENUM ('REQUESTED','PENDING','PROCESSING','COMPLETED','FAILED','CANCELLED');
  END IF;
END$$;

-- 2) Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type public.txn_type NOT NULL,
  method text,
  amount numeric(18,8) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  reference text,
  status public.txn_status NOT NULL DEFAULT 'REQUESTED',
  receipt_url text,
  metadata jsonb,
  balance_before numeric(18,8),
  balance_after numeric(18,8),
  risk_score numeric,
  processed_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions (user_id);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON public.transactions (status);
CREATE UNIQUE INDEX IF NOT EXISTS transactions_reference_idx ON public.transactions (reference);

-- 3) Audit table (append-only)
CREATE TABLE IF NOT EXISTS public.transaction_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  actor_id uuid,
  action text NOT NULL,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS transaction_audit_txn_idx ON public.transaction_audit (transaction_id);

-- 4) updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_updated_at ON public.transactions;
CREATE TRIGGER trg_set_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- 5) Notify trigger (pg_notify) for simple pub/sub
-- Apps can listen on "transactions_channel" via LISTEN/NOTIFY or a small server bridge can relay to websockets
CREATE OR REPLACE FUNCTION public.notify_transaction_change() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  payload json;
BEGIN
  payload = json_build_object(
    'event', TG_OP,
    'transaction', json_build_object(
      'id', NEW.id,
      'user_id', NEW.user_id,
      'type', NEW.type,
      'amount', NEW.amount,
      'currency', NEW.currency,
      'status', NEW.status,
      'reference', NEW.reference,
      'created_at', to_char(NEW.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
      'updated_at', to_char(NEW.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    )
  );

  PERFORM pg_notify('transactions_channel', payload::text);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_transaction ON public.transactions;
CREATE TRIGGER trg_notify_transaction
  AFTER INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE PROCEDURE public.notify_transaction_change();

-- 6) RLS policies
-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to INSERT their own transactions with status REQUESTED
CREATE POLICY insert_own_txn ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'REQUESTED'
  );

-- Allow authenticated users to SELECT only their own transactions
CREATE POLICY select_own_txn ON public.transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Restrict UPDATEs to admin role only (service role should bypass RLS)
-- Admins identified by JWT claim 'role' = 'admin' (adjust if you use different claim)
CREATE POLICY admin_update_txn ON public.transactions
  FOR UPDATE
  TO authenticated
  USING (current_setting('jwt.claims.role', true) = 'admin')
  WITH CHECK (current_setting('jwt.claims.role', true) = 'admin');

-- Allow admins to DELETE if necessary
CREATE POLICY admin_delete_txn ON public.transactions
  FOR DELETE
  TO authenticated
  USING (current_setting('jwt.claims.role', true) = 'admin');

-- 7) Audit table RLS (append-only by server/admin)
ALTER TABLE public.transaction_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_insert_service ON public.transaction_audit
  FOR INSERT
  TO authenticated
  USING (current_setting('jwt.claims.role', true) = 'admin')
  WITH CHECK (current_setting('jwt.claims.role', true) = 'admin');

CREATE POLICY audit_select_admin ON public.transaction_audit
  FOR SELECT
  TO authenticated
  USING (current_setting('jwt.claims.role', true) = 'admin');

-- Note: Supabase service role bypasses RLS so server-side jobs can write/read freely using the service key.

-- 8) Helper: sample function to create transaction + audit (to be called from server-side)
CREATE OR REPLACE FUNCTION public.create_transaction_with_audit(
  p_user_id uuid,
  p_type public.txn_type,
  p_method text,
  p_amount numeric,
  p_currency text,
  p_reference text,
  p_metadata jsonb,
  p_actor_id uuid DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE
  v_txn_id uuid;
BEGIN
  INSERT INTO public.transactions (user_id, type, method, amount, currency, reference, metadata)
  VALUES (p_user_id, p_type, p_method, p_amount, COALESCE(p_currency,'USD'), p_reference, p_metadata)
  RETURNING id INTO v_txn_id;

  INSERT INTO public.transaction_audit (transaction_id, actor_id, action, payload)
  VALUES (v_txn_id, p_actor_id, 'CREATE', json_build_object('reference', p_reference, 'metadata', p_metadata));

  RETURN v_txn_id;
END;
$$;

-- Done.

-- IMPORTANT: Review policies and JWT claim names before applying in production.
-- After running this migration, implement server-side webhook handlers that:
--  - verify gateway signatures
--  - call transactional updates (update transaction status, adjust user balance) inside DB transactions
--  - insert audit rows
--  - rely on pg_notify or a small relay process to push events to admin websockets
