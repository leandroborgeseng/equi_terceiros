# Homologação de Equipamentos de Terceiros

Sistema web/PWA para gestão de equipamentos médico-hospitalares de terceiros — portal de homologação técnica e compliance documental para Engenharia Clínica hospitalar.

## Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui patterns, Framer Motion, TanStack Query, React Hook Form, Zod
- **Backend:** Next.js App Router, Prisma ORM, SQLite (MVP) — pronto para PostgreSQL
- **Infra:** Docker, Railway, PWA (Serwist), upload S3-compatible (R2/B2/AWS)

## Perfis de usuário

| Perfil | E-mail demo | Senha |
|--------|-------------|-------|
| Admin | admin@hospital.local | Hospital@2026 |
| Engenharia Clínica | ec@hospital.local | Hospital@2026 |
| Médico | medico@hospital.local | Hospital@2026 |
| Fornecedor | fornecedor@hospital.local | Hospital@2026 |

## Execução local

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env

# Banco de dados
npm run db:migrate
npm run db:seed

# Desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Link demo fornecedor

`/fornecedor/demotoken123456`

## Variáveis de ambiente

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-longa"

S3_ENDPOINT="https://....r2.cloudflarestorage.com"
S3_BUCKET="equipamentos-docs"
S3_ACCESS_KEY="..."
S3_SECRET_KEY="..."
S3_REGION="auto"
```

Sem credenciais S3, uploads são registrados no banco com `storageKey` local (modo MVP).

## Fluxo operacional

1. Médico cria solicitação (wizard step-by-step com autosave)
2. Sistema gera protocolo e link para fornecedor
3. Fornecedor/médico enviam documentos e fotos obrigatórias (mobile-first, câmera, offline)
4. Engenharia Clínica analisa checklist documental
5. Inspeção técnica → liberação / restrição / bloqueio
6. Geração de etiqueta e termo em PDF
7. Dashboard executivo com KPIs e fila de homologação

## PostgreSQL (produção)

Em `prisma/schema.prisma`, altere:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Execute `npm run db:migrate` com `DATABASE_URL` PostgreSQL.

## Docker

```bash
docker compose up --build
```

## Deploy Railway

1. Crie projeto no [Railway](https://railway.app)
2. Conecte o repositório
3. Configure variáveis de `.env.example`
4. Use volume persistente para SQLite ou PostgreSQL gerenciado
5. Deploy automático via `Dockerfile` / `railway.json`

```bash
chmod +x scripts/deploy-railway.sh
./scripts/deploy-railway.sh
```

## Estrutura principal

```
prisma/schema.prisma    # Modelos completos (User, EquipmentRequest, AuditLog, etc.)
src/app/api/            # REST APIs
src/components/         # UI mobile-first, upload, checklist EC
src/lib/                # Auth, RBAC, S3, PDF, offline queue
public/manifest.webmanifest
```

## PWA

- Instalável no celular (Add to Home Screen)
- Service Worker com cache (Serwist)
- Fila offline IndexedDB para fotos/documentos

## Segurança

- Autenticação NextAuth (credentials)
- RBAC por perfil
- AuditLog com IP, user-agent, timestamp
- URLs assinadas S3 para download/upload

## OCR / IA (preparado)

Tabela `EquipmentImageMetadata` com campos para texto extraído, série detectada e `aiValidationStatus`.

---

Desenvolvido para operação hospitalar enterprise-ready.
