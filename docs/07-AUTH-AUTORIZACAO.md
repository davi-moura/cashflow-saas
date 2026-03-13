# ETAPA 7 — Autenticação e Autorização

## Login (e-mail e senha)

1. Cliente envia POST /api/auth/login com `{ email, password }`.
2. Backend busca usuário por e-mail; verifica senha com **Argon2.verify(hash, password)**.
3. Gera **access token** JWT (curta duração, ex.: 15 min) com payload: `{ sub: userId, email, tenantId? }`.
4. Gera **refresh token** (UUID ou random), grava em `sessions` com `userId` e `expiresAt` (ex.: 7 dias).
5. Resposta: `{ accessToken, refreshToken, expiresIn, user, tenant }` (tenant pode ser o primeiro do usuário ou o último usado).

## Payload JWT (access token)

```json
{
  "sub": "uuid-user-id",
  "email": "user@example.com",
  "tenantId": "uuid-tenant-id",
  "iat": 1234567890,
  "exp": 1234568790
}
```

- `tenantId` opcional no login; pode ser preenchido no switch-tenant.

## Refresh token

1. POST /api/auth/refresh com `{ refreshToken }`.
2. Busca session por refreshToken; verifica se não está revogada e se não expirou.
3. Gera novo access token (e opcionalmente novo refresh token rotativo).
4. Retorna `{ accessToken, expiresIn }`.

## Troca de tenant

1. POST /api/auth/switch-tenant com `{ tenantId }`.
2. Verifica se o usuário pertence ao tenant (tenant_users).
3. Emite novo access token com o novo `tenantId` no payload.
4. Retorna `{ accessToken, expiresIn, tenant }`.

## Logout

1. POST /api/auth/logout com `{ refreshToken }` ou com token no header.
2. Revoga a session (revokedAt = now ou remove registro).
3. Retorna 204.

## Middleware/Guard para tenant

- **TenantGuard:** Lê `tenantId` do JWT (ou header X-Tenant-Id). Se rota exige tenant, valida se usuário tem TenantUser para esse tenant. Injeta tenantId no request para os serviços usarem.
- Todas as queries de negócio devem filtrar por `tenantId` do contexto.

## Guard de permissões

- **PermissionsGuard:** Recebe metadados da rota (ex.: `@RequirePermission('entry:edit')`). Obtém role do usuário no tenant (TenantUser.roleId → Role.slug ou lista de Permission.slug). Se a role tem a permissão exigida, permite; senão 403.

## Proteção de rotas

- Rotas públicas: POST /auth/login, POST /auth/refresh, GET /health.
- Rotas protegidas: JwtAuthGuard + (opcional) TenantGuard + (opcional) PermissionsGuard.
- Exemplo: `@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)` e `@RequirePermission('category:edit')`.

## Vinculação usuário–empresa

- Tabela `tenant_users`: (tenantId, userId, roleId). Um usuário pode ter várias linhas (várias empresas).
- No login, retornar lista de tenants do usuário para seleção no frontend.
- Acesso a recursos sempre no contexto do `tenantId` do token.

---

*Documento parte do projeto CashFlow SaaS — Etapa 7.*
