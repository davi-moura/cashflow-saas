# ETAPA 11 — Infraestrutura e DevOps

## Docker

- **Backend Dockerfile:** Multi-stage; stage 1 build (npm ci, nest build), stage 2 run (node dist/main); usuário non-root.
- **Frontend Dockerfile:** Build estático (npm ci, npm run build); servir com nginx ou apenas artefato para CDN.
- **docker-compose.yml:** Serviços: postgres, redis, minio; opcional backend e frontend para ambiente completo. Variáveis via env_file ou environment.

## Variáveis de ambiente

- Ver `infra/.env.example`: DATABASE_URL, REDIS_URL, JWT_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES, S3_*, NODE_ENV, PORT, LOG_LEVEL.

## Scripts úteis

- Root: pnpm dev:backend, dev:frontend, build, db:generate, db:migrate, db:seed, docker:up, docker:down.
- Backend: prisma migrate dev, prisma generate, prisma db seed.

## Health checks

- GET /api/health → status ok.
- GET /api/health/db → Prisma $queryRaw SELECT 1.
- GET /api/health/redis → Redis ping.
- Docker: healthcheck no container do backend (curl localhost:3000/api/health).

## CI/CD (GitHub Actions)

- Workflow em .github/workflows/ci.yml: checkout, pnpm install, build backend e frontend (e opcional lint/test).
- Deploy: separado (ex.: deploy em push para main; ou manual); build de imagem Docker e push para registry; deploy em staging/prod.

## Migrations

- Prisma Migrate; migrations versionadas na pasta prisma/migrations; aplicar em todos os ambientes (dev, staging, prod) antes do deploy da app.

## Seed

- Script em prisma/seed.ts: criar 1 tenant, 1 usuário admin, roles e permissions iniciais, categorias exemplo, 1 conta caixa e 1 conta bancária. Rodar após migrate em dev.

## Ambientes

- **dev:** .env local; docker-compose sobe postgres, redis, minio; backend e frontend rodam local (pnpm dev).
- **staging/prod:** Variáveis no ambiente ou secrets; banco e Redis gerenciados; S3 real; múltiplas réplicas se necessário.

---

*Documento parte do projeto CashFlow SaaS — Etapa 11.*
