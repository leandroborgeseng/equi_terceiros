#!/bin/sh
set -e

MISSING=""

if [ -z "$DATABASE_URL" ]; then
  MISSING="${MISSING}\n  - DATABASE_URL (ex: file:/data/prod.db com volume em /data)"
fi

if [ -z "$NEXTAUTH_SECRET" ] && [ -z "$AUTH_SECRET" ]; then
  MISSING="${MISSING}\n  - NEXTAUTH_SECRET e AUTH_SECRET (mesmo valor, 32+ caracteres)"
fi

if [ -z "$NEXTAUTH_URL" ]; then
  MISSING="${MISSING}\n  - NEXTAUTH_URL (ex: https://equiterceiros-production.up.railway.app)"
fi

if [ -n "$MISSING" ]; then
  echo "=========================================="
  echo "ERRO: Variáveis obrigatórias ausentes no Railway:"
  printf "%b\n" "$MISSING"
  echo ""
  echo "Configure em: Project → equi_terceiros → Variables"
  echo "=========================================="
  exit 1
fi

# NextAuth v5 usa AUTH_SECRET; garantir que exista
if [ -z "$AUTH_SECRET" ]; then
  export AUTH_SECRET="$NEXTAUTH_SECRET"
fi

export NEXTAUTH_URL="${NEXTAUTH_URL%/}"

echo "==> DATABASE_URL configurada"
echo "==> NEXTAUTH_URL=$NEXTAUTH_URL"

echo "==> Aplicando migrations Prisma..."
prisma migrate deploy

echo "==> Garantindo usuários iniciais (seed)..."
node /app/scripts/seed-production.mjs

echo "==> Iniciando aplicação..."
exec node server.js
