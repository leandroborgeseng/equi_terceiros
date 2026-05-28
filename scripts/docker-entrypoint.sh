#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "==> Aplicando migrations Prisma..."
  prisma migrate deploy
  echo "==> Garantindo usuários iniciais (seed)..."
  node /app/scripts/seed-production.mjs || echo "Aviso: seed não executado."
else
  echo "==> DATABASE_URL não definida; pulando migrations e seed."
fi

echo "==> Iniciando aplicação..."
exec node server.js
