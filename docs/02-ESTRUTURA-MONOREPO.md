# ETAPA 2 — Estrutura do Monorepo

## Organização do Monorepo

O projeto segue uma estrutura de monorepo com:

- **apps/** — aplicações (frontend e backend)
- **packages/** — código compartilhado (tipos, constantes, validações)
- **infra/** — configurações de infraestrutura (Docker, CI/CD)
- **docs/** — documentação do projeto

---

## Árvore de Pastas Detalhada

```
cashflow-saas/
├── apps/
│   ├── backend/                    # API NestJS + Fastify
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/             # Guards, filters, decorators, interceptors
│   │   │   ├── config/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── tenants/
│   │   │   │   ├── users/
│   │   │   │   ├── roles/
│   │   │   │   ├── accounts/
│   │   │   │   ├── categories/
│   │   │   │   ├── cost-centers/
│   │   │   │   ├── customers/
│   │   │   │   ├── suppliers/
│   │   │   │   ├── financial-entries/
│   │   │   │   ├── payables/
│   │   │   │   ├── receivables/
│   │   │   │   ├── reconciliation/
│   │   │   │   ├── attachments/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── reports/
│   │   │   │   ├── audit/
│   │   │   │   ├── notifications/
│   │   │   │   └── health/
│   │   │   └── prisma/
│   │   ├── test/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── nest-cli.json
│   │
│   └── frontend/                   # React + Vite
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── api/                # Cliente HTTP, interceptors
│       │   ├── auth/               # Provider, guards, hooks
│       │   ├── components/         # Componentes reutilizáveis
│       │   ├── layouts/
│       │   ├── modules/            # Módulos de negócio
│       │   │   ├── dashboard/
│       │   │   ├── entries/        # Lançamentos
│       │   │   ├── payables/
│       │   │   ├── receivables/
│       │   │   ├── reconciliation/
│       │   │   ├── accounts/
│       │   │   ├── categories/
│       │   │   ├── cost-centers/
│       │   │   ├── customers/
│       │   │   ├── suppliers/
│       │   │   ├── reports/
│       │   │   ├── users/
│       │   │   └── settings/
│       │   ├── routes/
│       │   ├── stores/             # Estado global (se necessário)
│       │   ├── types/
│       │   └── utils/
│       ├── public/
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
│
├── packages/
│   └── shared/                     # Código compartilhado
│       ├── src/
│       │   ├── types/              # Tipos e interfaces compartilhados
│       │   ├── constants/         # Constantes (roles, permissions)
│       │   ├── validation/        # Schemas Zod compartilhados
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── infra/
│   ├── docker/
│   │   ├── backend.Dockerfile
│   │   └── frontend.Dockerfile
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── .env.example
│
├── docs/
│   ├── 01-VISAO-GERAL.md
│   ├── 02-ESTRUTURA-MONOREPO.md
│   ├── 03-ESTRUTURA-BACKEND.md
│   ├── 04-ESTRUTURA-FRONTEND.md
│   ├── 05-MODELAGEM-DADOS.md
│   ├── 06-ENDPOINTS-MVP.md
│   ├── 07-AUTH-AUTORIZACAO.md
│   ├── 08-FLUXOS-CRITICOS.md
│   ├── 09-DASHBOARD-RELATORIOS.md
│   ├── 10-SEGURANCA.md
│   ├── 11-INFRA-DEVOPS.md
│   ├── 13-PRIORIDADE-IMPLEMENTACAO.md
│   └── 14-PADROES-QUALIDADE.md
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── package.json                    # Workspace root (npm/pnpm workspaces)
├── pnpm-workspace.yaml
├── .env.example
├── .gitignore
└── README.md
```

---

## Descrição das Raízes

| Pasta | Uso |
|-------|-----|
| **apps/backend** | API REST NestJS com Fastify, Prisma, Redis, BullMQ, S3/MinIO. |
| **apps/frontend** | SPA React com Vite, roteamento por módulos, TanStack Query, React Hook Form. |
| **packages/shared** | Tipos TypeScript, constantes (roles, permissions), schemas Zod usados por backend e frontend. |
| **infra** | Dockerfiles, docker-compose, exemplo de .env para subir ambiente local. |
| **docs** | Documentação das etapas do projeto (visão, estrutura, modelagem, endpoints, fluxos, etc.). |

---

## Gerenciamento de Workspaces

Recomenda-se **pnpm** para workspaces:

- `pnpm-workspace.yaml` define `apps/*` e `packages/*`.
- Dependências comuns podem ficar no root; cada app/package tem seu `package.json`.
- Scripts no root: `pnpm run dev:backend`, `pnpm run dev:frontend`, `pnpm run build`, etc.

---

*Documento parte do projeto CashFlow SaaS — Etapa 2.*
