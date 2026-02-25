-- Migration: 0002_process_transaction.sql
-- Adds a stored procedure to process transaction updates atomically (update txn, adjust user balance, write audit)

CREATE OR REPLACE FUNCTION public.process_transaction_update(
  p_txn_id uuid,
  p_new_status public.txn_status,
  p_processed_by uuid,
  p_metadata jsonb
) RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_txn RECORD;
  v_user_balance numeric(18,8);
  v_new_balance numeric(18,8);
BEGIN
  -- Lock the transaction row to avoid races
  SELECT * INTO v_txn FROM public.transactions WHERE id = p_txn_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  -- Only allow valid status transitions (simple guard)
  IF v_txn.status = p_new_status THEN
    -- still insert audit and exit
    INSERT INTO public.transaction_audit (transaction_id, actor_id, action, payload) VALUES (p_txn_id, p_processed_by, 'UPDATE_NOOP', json_build_object('status', p_new_status, 'metadata', p_metadata));
    RETURN;
  END IF;

  -- If marking COMPLETED and it's a deposit, update user balance
  IF p_new_status = 'COMPLETED' THEN
    -- get current balance
    SELECT balance INTO v_user_balance FROM public.users WHERE id = v_txn.user_id FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'User not found';
    END IF;

    IF v_txn.type = 'DEPOSIT' THEN
      v_new_balance = COALESCE(v_user_balance,0) + COALESCE(v_txn.amount,0);
    ELSIF v_txn.type = 'WITHDRAWAL' THEN
      v_new_balance = COALESCE(v_user_balance,0) - COALESCE(v_txn.amount,0);
    ELSE
      v_new_balance = v_user_balance;
    END IF;

    -- update transaction with balance_before/after and status
    UPDATE public.transactions SET
      status = p_new_status,
      processed_by = p_processed_by,
      balance_before = v_user_balance,
      balance_after = v_new_balance,
      metadata = COALESCE(metadata, '{}'::jsonb) || COALESCE(p_metadata, '{}'::jsonb)
    WHERE id = p_txn_id;

    -- update user balance
    UPDATE public.users SET balance = v_new_balance WHERE id = v_txn.user_id;

    -- audit
    INSERT INTO public.transaction_audit (transaction_id, actor_id, action, payload)
      VALUES (p_txn_id, p_processed_by, 'COMPLETE', json_build_object('previous_balance', v_user_balance, 'new_balance', v_new_balance, 'metadata', p_metadata));

  ELSE
    -- Other status transitions: just update status and metadata
    UPDATE public.transactions SET
      status = p_new_status,
      processed_by = p_processed_by,
      metadata = COALESCE(metadata, '{}'::jsonb) || COALESCE(p_metadata, '{}'::jsonb)
    WHERE id = p_txn_id;

    INSERT INTO public.transaction_audit (transaction_id, actor_id, action, payload)
      VALUES (p_txn_id, p_processed_by, 'UPDATE_STATUS', json_build_object('status', p_new_status, 'metadata', p_metadata));
  END IF;

END;
$$;

-- Grant execute to authenticated role (server should use service key to bypass RLS anyway)
GRANT EXECUTE ON FUNCTION public.process_transaction_update(uuid, public.txn_status, uuid, jsonb) TO authenticated;
