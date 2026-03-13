# CashFlow SaaS

SaaS B2B de controle financeiro de caixa para pequenas e médias empresas (multi-tenant).

## Stack

- **Backend:** Node.js, TypeScript, NestJS, Fastify, Prisma, PostgreSQL, Redis, BullMQ, S3/MinIO
- **Frontend:** React, TypeScript, Vite, TanStack Query, React Hook Form
- **Infra:** Docker, Docker Compose

## Estrutura

- `apps/backend` — API NestJS
- `apps/frontend` — SPA React
- `packages/shared` — Tipos e validações compartilhados
- `infra` — Docker e docker-compose
- `docs` — Documentação do projeto

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- Docker e Docker Compose (para ambiente local com PostgreSQL, Redis, MinIO)

## Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Subir infraestrutura (PostgreSQL, Redis, MinIO)
pnpm docker:up

# Configurar variáveis de ambiente
cp infra/.env.example .env
# Editar .env com as conexões

# Gerar Prisma client e rodar migrations
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Backend
pnpm dev:backend

# Frontend (outro terminal)
pnpm dev:frontend
```

## Documentação

Consulte a pasta `docs/` para visão geral, estrutura, modelagem, endpoints e fluxos.
