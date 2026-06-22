#!/bin/sh

export PORT="${PORT:-8080}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"

# Defaults para Railway quando Variables não foram criadas no painel
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/data/prod.db"
  echo "==> DATABASE_URL padrão: $DATABASE_URL"
fi

if [ -z "$NEXTAUTH_URL" ]; then
  if [ -n "$RAILWAY_PUBLIC_DOMAIN" ]; then
    export NEXTAUTH_URL="https://${RAILWAY_PUBLIC_DOMAIN}"
    echo "==> NEXTAUTH_URL automático: $NEXTAUTH_URL"
  fi
fi

if [ -z "$AUTH_SECRET" ] && [ -z "$NEXTAUTH_SECRET" ]; then
  DOMAIN="${RAILWAY_PUBLIC_DOMAIN:-equiterceiros-production.up.railway.app}"
  export AUTH_SECRET="railway-auto-secret-${DOMAIN}-min-32-chars!!"
  export NEXTAUTH_SECRET="$AUTH_SECRET"
  echo "==> AUTH_SECRET automático (defina NEXTAUTH_SECRET no Railway para produção)"
fi

if [ -z "$AUTH_SECRET" ] && [ -n "$NEXTAUTH_SECRET" ]; then
  export AUTH_SECRET="$NEXTAUTH_SECRET"
fi

if [ -n "$NEXTAUTH_URL" ]; then
  export NEXTAUTH_URL="${NEXTAUTH_URL%/}"
fi

echo "==> DATABASE_URL=$DATABASE_URL"
echo "==> NEXTAUTH_URL=${NEXTAUTH_URL:-não definida}"

mkdir -p /data
export UPLOAD_DIR="${UPLOAD_DIR:-/data/uploads}"
mkdir -p "$UPLOAD_DIR"
chown -R nextjs:nodejs /data 2>/dev/null || chmod -R 777 /data 2>/dev/null || true
echo "==> UPLOAD_DIR=$UPLOAD_DIR"

echo "==> Aplicando migrations..."
if prisma migrate deploy; then
  echo "==> Migrations OK"
else
  echo "AVISO: migrate deploy falhou — aplicando schema via db push (fallback)"
  # Garante o schema mesmo com histórico de migrations divergente (ex.: migration renomeada)
  if prisma db push --accept-data-loss --skip-generate; then
    echo "==> Schema sincronizado via db push"
  else
    echo "ERRO: não foi possível sincronizar o schema"
  fi
fi

echo "==> Seed usuários demo..."
if node /app/scripts/seed-production.mjs; then
  echo "==> Seed OK — login: admin@hospital.local / Hospital@2026"
else
  echo "AVISO: seed falhou"
fi

echo "==> Seed parque legado Unimed Franca..."
if node /app/scripts/seed-unimed-franca-parque.mjs; then
  echo "==> Parque Unimed Franca OK (idempotente)"
else
  echo "AVISO: seed Unimed Franca falhou"
fi

echo "==> Iniciando Next.js na porta $PORT"
cd /app
exec su-exec nextjs:nodejs node server.js
