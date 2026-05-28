#!/bin/sh

export PORT="${PORT:-8080}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"

if [ -z "$AUTH_SECRET" ] && [ -n "$NEXTAUTH_SECRET" ]; then
  export AUTH_SECRET="$NEXTAUTH_SECRET"
fi

if [ -n "$NEXTAUTH_URL" ]; then
  export NEXTAUTH_URL="${NEXTAUTH_URL%/}"
fi

CONFIG_OK=1

if [ -z "$DATABASE_URL" ]; then
  echo "AVISO: DATABASE_URL ausente — configure file:/data/prod.db"
  CONFIG_OK=0
fi

if [ -z "$NEXTAUTH_SECRET" ] && [ -z "$AUTH_SECRET" ]; then
  echo "AVISO: NEXTAUTH_SECRET / AUTH_SECRET ausentes"
  CONFIG_OK=0
fi

if [ -z "$NEXTAUTH_URL" ]; then
  echo "AVISO: NEXTAUTH_URL ausente"
  CONFIG_OK=0
fi

if [ "$CONFIG_OK" = "1" ]; then
  echo "==> Configuração OK"
  echo "==> NEXTAUTH_URL=$NEXTAUTH_URL"

  mkdir -p /data
  chown -R nextjs:nodejs /data 2>/dev/null || chmod 777 /data 2>/dev/null || true

  echo "==> Aplicando migrations..."
  if prisma migrate deploy; then
    echo "==> Migrations OK"
  else
    echo "AVISO: migrate deploy falhou (verifique volume /data e DATABASE_URL)"
  fi

  echo "==> Seed usuários demo..."
  if node /app/scripts/seed-production.mjs; then
    echo "==> Seed OK"
  else
    echo "AVISO: seed falhou"
  fi
else
  echo "==> App sobe mesmo assim — confira https://seu-dominio/api/health"
fi

echo "==> Iniciando Next.js na porta $PORT"
cd /app
exec su-exec nextjs:nodejs node server.js
