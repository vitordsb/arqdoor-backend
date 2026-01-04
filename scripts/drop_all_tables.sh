#!/usr/bin/env bash
set -euo pipefail

# Uso:
#   DB_HOST=localhost DB_USER=root DB_PASS=senha DB_NAME=arqdoordb ./scripts/drop_all_tables.sh
# Script destrutivo: remove TODAS as tabelas do schema informado.


DB_HOST="localhost"
DB_USER="root"
DB_PASS="senha123"
DB_NAME="arqdoordb"

SQL_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/drop_all_tables.sql"

if [[ -z "$DB_PASS" ]]; then
  # sem senha
  mysql -h "$DB_HOST" -u "$DB_USER" "$DB_NAME" < "$SQL_FILE"
else
  mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_FILE"
fi

echo "Todas as tabelas removidas do schema '$DB_NAME'."
