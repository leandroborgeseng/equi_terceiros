# GestEq — Conformidade com a Norma 445.000

Matriz spec × implementação. Legenda: ✅ implementado | 🟡 parcial | ⬜ planejado (estrutura pronta)

## Stack

| Item | Status |
|------|--------|
| Next.js 15 (App Router) + TS + Tailwind | ✅ |
| shadcn/ui (padrão) | 🟡 componentes no padrão, sem CLI Radix completa |
| Estado (TanStack Query + RHF + Zod) | ✅ (Zustand não usado; spec aceita) |
| IndexedDB (Dexie) offline | 🟡 IndexedDB próprio (sem Dexie), fila + sync |
| Banco | ✅ Prisma/SQLite (PostgreSQL-ready) |
| Auth | ✅ NextAuth (spec aceita) |
| PWA (Service Worker, manifest, offline) | ✅ Serwist |
| @react-pdf/renderer | 🟡 PDF via jsPDF (etiqueta + termo) |

## Módulos (seção 5)

| Módulo | Status |
|--------|--------|
| 5.1 Solicitação (Anexo I) — wizard, paciente/prontuário, tipo de ingresso, fluxo | ✅ |
| 5.2 Cadastro EC (série, patrimônio, OS interna, classe, armazenagem) | ✅ `/equipamentos/[id]/cadastro` |
| 5.3 Checklist documental (Anexo II) — 8 itens Sim/Não/N/A + obs | ✅ |
| 5.4 Inspeção técnica (Anexo III) — 7 itens Conforme/NC/N/A + TSE + CME + assinatura | ✅ |
| 5.5 Termo de responsabilidade (Anexo IV) | 🟡 PDF gerado; assinatura canvas na inspeção (termo dedicado Fase 2) |
| 5.6 Status e rastreabilidade (lista + filtros + busca série) | ✅ `/equipamentos` |
| 5.7 Classificação automática A/B/C/D | ✅ `src/lib/classification.ts` |
| 5.8 Fluxo de urgência (Classe D, task D+1) | ✅ status `FLUXO_URGENCIA` + alerta regularização |
| 5.9 Etiqueta Bluetooth (ZPL) | ⬜ Fase 2 (hoje etiqueta PDF) |
| 5.10 Notificações | 🟡 alertas in-app + reprovação |
| 5.11 Indicadores (KPIs + por classe) | 🟡 dashboard executivo + `porClasse` na API |
| 5.12 Histórico/auditoria (AuditLog imutável) | ✅ |

## Status do equipamento (seção 5.6)

Implementados exatamente conforme a norma:
`AGUARDANDO_CADASTRO`, `AGUARDANDO_DOCUMENTOS`, `PENDENTE_DOCUMENTOS`, `AGUARDANDO_INSPECAO`,
`LIBERADO`, `LIBERADO_COM_RESTRICAO`, `BLOQUEADO`, `EM_USO`, `AGUARDANDO_RETIRADA`, `RETIRADO`, `FLUXO_URGENCIA`.

## Regras de negócio (seção 9)

| Regra | Status |
|-------|--------|
| Classe A exige autorização da diretoria | ✅ validado no cadastro |
| Classe D → task de regularização D+1 | ✅ `regularizationDueAt` + alerta |
| Reprovar checklist exige motivo + notifica | ✅ |
| Bloqueio na inspeção exige motivo | ✅ |
| Registros não excluídos (retenção) | ✅ apenas mudança de status (`RETIRADO`) |
| Etiqueta registrada no log | 🟡 inspeção logada; impressão Bluetooth Fase 2 |

## Próximas fases

- **Fase 2:** etiqueta Bluetooth (Web Bluetooth + ZPL) + fallback PDF, QR Code público de consulta, termo Anexo IV dedicado com assinatura remota, notificações push.
- **Fase 3:** indicadores com gráfico de pizza + export CSV/PDF, OCR/IA (`EquipmentImageMetadata`), gestão de usuários/configurações.

## Usuários seed (senha `Hospital@2026`)

| E-mail | Perfil |
|--------|--------|
| admin@hospital.local | ADMIN |
| ec@hospital.local | ENGENHARIA_CLINICA |
| medico@hospital.local | MEDICO |
| fornecedor@hospital.local | FORNECEDOR |
| centro@hospital.local | CENTRO_CIRURGICO |
| cme@hospital.local | CME_CCIH_NSP |
