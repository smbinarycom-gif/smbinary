#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL must be set (postgres connection string)}"

echo "Running SQL migrations from migrations/"
for f in migrations/*.sql; do
  echo "--> $f"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done

echo "Migrations completed."
