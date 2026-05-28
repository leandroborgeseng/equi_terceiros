#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "==> Aplicando migrations Prisma..."
  prisma migrate deploy
else
  echo "==> DATABASE_URL não definida; pulando migrations."
fi

echo "==> Iniciando aplicação..."
exec node server.js
