-- Row Level Security policies for transactions and users
-- NOTE: Review and adapt JWT claim checks to match your auth JWT claims

-- Enable RLS
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Transactions: allow users to SELECT only their own transactions
CREATE POLICY IF NOT EXISTS transactions_select_own
  ON public.transactions
  FOR SELECT
  USING (user_id = auth.uid());

-- Transactions: allow users to INSERT a transaction tied to their own user_id
CREATE POLICY IF NOT EXISTS transactions_insert_own
  ON public.transactions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Transactions: allow admin role full access
-- Adjust the claim path if your JWT uses a different claim name for role (e.g. 'role' or 'app_metadata->role')
CREATE POLICY IF NOT EXISTS transactions_admin_full
  ON public.transactions
  FOR ALL
  USING (current_setting('jwt.claims.role', true) = 'admin')
  WITH CHECK (current_setting('jwt.claims.role', true) = 'admin');

-- Users: allow users to read their own record
CREATE POLICY IF NOT EXISTS users_select_own
  ON public.users
  FOR SELECT
  USING (id = auth.uid());

-- Users: disallow arbitrary updates by regular users; only allow admin to update or RPC functions.
CREATE POLICY IF NOT EXISTS users_admin_update
  ON public.users
  FOR UPDATE
  USING (current_setting('jwt.claims.role', true) = 'admin')
  WITH CHECK (current_setting('jwt.claims.role', true) = 'admin');

-- Grant execute on process_transaction_update to authenticated (RPC will run server-side with service key in most flows)
GRANT EXECUTE ON FUNCTION public.process_transaction_update(uuid, text, uuid, jsonb) TO authenticated;

-- Reminder: after applying, verify the policies in Supabase UI and adapt claim checks if needed.
