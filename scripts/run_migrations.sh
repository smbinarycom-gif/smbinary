#!/usr/bin/env bash
set -euo pipefail

# Simple migration runner. Provide either DATABASE_URL or DB_USER/DB_PASS/DB_HOST/DB_PORT/DB_NAME.
# Usage:
#   DATABASE_URL=postgres://user:pass@host:5432/dbname ./scripts/run_migrations.sh
# or set env vars in a .env file and source it first: source .env

: ${DATABASE_URL:=""}

if [ -z "$DATABASE_URL" ]; then
  : ${DB_USER:=""}
  : ${DB_PASS:=""}
  : ${DB_HOST:=""}
  : ${DB_PORT:=5432}
  : ${DB_NAME:=""}
  if [ -z "$DB_USER" ] || [ -z "$DB_PASS" ] || [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ]; then
    echo "Error: set DATABASE_URL or DB_USER/DB_PASS/DB_HOST/DB_NAME"
    exit 2
  fi
  DATABASE_URL="postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
fi

echo "Using DATABASE_URL=${DATABASE_URL}"

psql "$DATABASE_URL" -f migrations/0001_create_transactions.sql
psql "$DATABASE_URL" -f migrations/0002_process_transaction.sql
psql "$DATABASE_URL" -f migrations/0003_rls_policies.sql

echo "Migrations applied (or psql returned success). Verify in DB." 
