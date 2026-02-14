#!/usr/bin/env bash
# Setup PostgreSQL + pgvector for Roadmapper (Homebrew on Mac).
# Uses PostgreSQL 17 if available (pgvector is built for 17/18); else falls back to 16.
# Run from repo root or backend dir.

set -e

# Homebrew paths (Apple Silicon = /opt/homebrew, Intel = /usr/local)
if [[ -d /opt/homebrew/opt/postgresql@17 ]]; then
  BREW_PREFIX="/opt/homebrew"
elif [[ -d /opt/homebrew/opt/postgresql@16 ]]; then
  BREW_PREFIX="/opt/homebrew"
else
  BREW_PREFIX="/usr/local"
fi

# pgvector on Homebrew is built for Postgres 17/18 only. Use 17 so extension works.
if [[ -d "$BREW_PREFIX/opt/postgresql@17" ]]; then
  PG_VER=17
elif [[ -d "$BREW_PREFIX/opt/postgresql@16" ]]; then
  echo "ERROR: Homebrew pgvector is built for PostgreSQL 17/18, not 16."
  echo "  Install Postgres 17 and re-run this script:"
  echo "    brew install postgresql@17"
  echo "    ./scripts/setup-db-brew.sh"
  exit 1
else
  echo "ERROR: PostgreSQL not found. Install with: brew install postgresql@17"
  exit 1
fi

PG_BIN="$BREW_PREFIX/opt/postgresql@$PG_VER/bin"
# Postgres 17+ on Homebrew uses sharedir from pg_config (e.g. /opt/homebrew/share/postgresql@17)
PG_SHAREDIR="$("$PG_BIN/pg_config" --sharedir 2>/dev/null)" || PG_SHAREDIR="$BREW_PREFIX/opt/postgresql@$PG_VER/share/postgresql@$PG_VER"
PG_EXT="$PG_SHAREDIR/extension"

echo "==> Using PostgreSQL@$PG_VER"
echo "==> Starting PostgreSQL@$PG_VER..."
brew services start "postgresql@$PG_VER"
sleep 2

echo "==> Checking pgvector extension..."
if [[ -f "$PG_EXT/vector.control" ]]; then
  echo "    pgvector present at $PG_EXT"
else
  echo "ERROR: pgvector not found in $PG_EXT"
  echo "  Install with: brew install pgvector"
  exit 1
fi

echo "==> Creating database 'roadmapper' (if needed)..."
"$PG_BIN/createdb" roadmapper 2>/dev/null || true

echo "==> Enabling pgvector extension..."
"$PG_BIN/psql" roadmapper -c "CREATE EXTENSION IF NOT EXISTS vector;"

echo ""
echo "Done. Use in .env:"
echo "  DATABASE_URL=postgresql+asyncpg://$(whoami)@localhost:5432/roadmapper"
echo ""
echo "If you use a password for the postgres user:"
echo "  DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/roadmapper"
echo ""
