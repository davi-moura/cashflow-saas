# ETAPA 10 — Segurança

- **Validação de entrada:** class-validator nos DTOs; whitelist e forbidNonWhitelisted no ValidationPipe; nunca confiar em dados do cliente.
- **SQL injection:** Prisma usa queries parametrizadas; evitar raw queries com concatenação.
- **Rate limit em auth:** Limitar requisições a /auth/login e /auth/refresh por IP (ex.: 5/min) com throttler ou Redis.
- **CORS:** Configurar origens permitidas (frontend); em produção apenas domínios conhecidos.
- **Headers de segurança:** Helmet (ou equivalente Fastify): X-Content-Type-Options, X-Frame-Options, etc.
- **Controle por tenant:** Todo acesso a dados de negócio usa tenantId do JWT; nunca aceitar tenantId do body em operações que alterem dados; validar que o usuário pertence ao tenant.
- **Dados sensíveis:** Senhas apenas com hash Argon2; tokens em variáveis de ambiente; não logar senhas ou tokens.
- **Anexos:** Storage privado (S3 bucket sem acesso público); download apenas via **URL assinada** (presigned) com expiração curta; validar que o recurso pertence ao tenant e ao usuário.
- **Auditoria:** Registrar alterações críticas em AuditLog (quem, o quê, quando, valor antigo/novo).
- **Backup:** Política de backup do PostgreSQL (diário, retenção); testes de restore.
- **LGPD:** Dados financeiros são sensíveis; definir política de retenção e exclusão; anonimização ou exclusão sob demanda; documentar base legal e finalidade.

---

*Documento parte do projeto CashFlow SaaS — Etapa 10.*
