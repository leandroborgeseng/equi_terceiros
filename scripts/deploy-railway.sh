#!/usr/bin/env bash
set -euo pipefail

echo "==> Homologação de Equipamentos — Deploy Railway"
echo "Configure as variáveis no painel Railway:"
echo "  DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET"
echo "  S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY"
echo ""
echo "Para PostgreSQL em produção, altere provider em prisma/schema.prisma"
echo "e execute: npx prisma migrate deploy"
echo ""
echo "Deploy via CLI: railway up"
