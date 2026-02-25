#!/usr/bin/env bash
set -euo pipefail

# Simple test steps for deposit & withdrawal flow (adjust host and tokens)
# Replace placeholders: API_BASE, ADMIN_TOKEN, SERVICE_TOKEN

: ${API_BASE:="http://localhost:3001"}
: ${ADMIN_TOKEN:="<ADMIN_ACCESS_TOKEN>"}
: ${SERVICE_TOKEN:="<SERVICE_ROLE_KEY>"}

echo "1) POST deposit.requested (simulate external gateway)"
curl -s -X POST "$API_BASE/api/transactions-webhook" \
  -H "Content-Type: application/json" \
  -d '{"event":"deposit.requested","reference":"test-ref-123","user_id":"<USER_UUID>","type":"deposit","amount":1000,"currency":"USD","status":"PENDING"}' | jq .

echo "2) Verify admin UI receives event via realtime (manual check in admin panel)"
echo "3) Confirm transaction as admin via API"
curl -s -X POST "$API_BASE/api/admin/confirm-transaction" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"transaction_id":"<TXN_UUID>"}' | jq .

echo "4) Verify transaction status and user's balance in DB or via API"
