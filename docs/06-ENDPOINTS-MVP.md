# ETAPA 6 — Endpoints REST do MVP

Base URL: `/api`. Todas as rotas protegidas (exceto auth e health) exigem header `Authorization: Bearer <access_token>` e contexto de tenant (tenant_id no token ou header).

---

## Auth

| Método | Rota | Descrição | Body | Response |
|--------|------|-----------|------|----------|
| POST | /auth/login | Login | { email, password } | { accessToken, refreshToken, expiresIn, user, tenant } |
| POST | /auth/refresh | Refresh token | { refreshToken } | { accessToken, expiresIn } |
| POST | /auth/logout | Logout | { refreshToken } | 204 |
| POST | /auth/switch-tenant | Troca tenant ativo | { tenantId } | { accessToken, expiresIn, tenant } |

Permissão: nenhuma (público para login/refresh; logout e switch-tenant exigem JWT).

---

## Users (no contexto do tenant)

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | /users | Lista usuários do tenant | user:view |
| GET | /users/me | Dados do usuário logado + tenants + permissões | autenticado |
| GET | /users/:id | Usuário por id | user:view |
| POST | /users | Criar usuário no tenant | user:edit |
| PATCH | /users/:id | Atualizar usuário | user:edit |
| POST | /users/:id/tenants/:tenantId/role | Atribuir role no tenant | user:edit |
| DELETE | /users/:id/tenants/:tenantId | Remover usuário do tenant | user:edit |

---

## Tenants

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | /tenants | Lista tenants do usuário | autenticado |
| GET | /tenants/:id | Tenant por id | tenant:view |
| POST | /tenants | Criar tenant | tenant:edit (ou admin plataforma) |
| PATCH | /tenants/:id | Atualizar tenant | tenant:edit |

---

## Categories

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | /categories | Lista categorias do tenant | category:view |
| GET | /categories/:id | Categoria por id | category:view |
| POST | /categories | Criar categoria | category:edit |
| PATCH | /categories/:id | Atualizar categoria | category:edit |
| DELETE | /categories/:id | Soft delete | category:edit |

Request body (POST/PATCH): { name, type: 'income' | 'expense' }.

---

## Cost Centers

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | /cost-centers | Lista centros de custo | cost_center:view |
| GET | /cost-centers/:id | Por id | cost_center:view |
| POST | /cost-centers | Criar | cost_center:edit |
| PATCH | /cost-centers/:id | Atualizar | cost_center:edit |
| DELETE | /cost-centers/:id | Soft delete | cost_center:edit |

---

## Accounts

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | /accounts | Lista contas do tenant | account:view |
| GET | /accounts/:id | Conta por id | account:view |
| GET | /accounts/:id/balance | Saldo da conta | account:view |
| POST | /accounts | Criar conta | account:edit |
| PATCH | /accounts/:id | Atualizar | account:edit |
| DELETE | /accounts/:id | Soft delete | account:edit |

Body: { name, type: 'bank' | 'cash', bankCode?, agency?, accountNumber?, openingBalance? }.

---

## Customers

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | /customers | Lista clientes | customer:view |
| GET | /customers/:id | Por id | customer:view |
| POST | /customers | Criar | customer:edit |
| PATCH | /customers/:id | Atualizar | customer:edit |
| DELETE | /customers/:id | Soft delete | customer:edit |

---

## Suppliers

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | /suppliers | Lista fornecedores | supplier:view |
| GET | /suppliers/:id | Por id | supplier:view |
| POST | /suppliers | Criar | supplier:edit |
| PATCH | /suppliers/:id | Atualizar | supplier:edit |
| DELETE | /suppliers/:id | Soft delete | supplier:edit |

---

## Financial Entries

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | /financial-entries | Lista com filtros (accountId, startDate, endDate, type) | entry:view |
| GET | /financial-entries/:id | Por id | entry:view |
| POST | /financial-entries | Criar lançamento (receita/despesa) | entry:edit |
| POST | /financial-entries/transfer | Transferência entre contas | entry:edit |
| POST | /financial-entries/:id/reverse | Estornar lançamento | entry:edit |

Body criar: { accountId, categoryId, type: 'income'|'expense', value, description?, competenceDate, dueDate?, costCenterId?, customerId?, supplierId? }.  
Body transfer: { fromAccountId, toAccountId, value, date, description? }.

---

## Payables

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | /payables | Lista (filtros: status, supplierId, dueFrom, dueTo) | payable:view |
| GET | /payables/:id | Por id com parcelas | payable:view |
| POST | /payables | Criar conta a pagar (e parcelas) | payable:edit |
| PATCH | /payables/:id | Atualizar (dados gerais) | payable:edit |
| POST | /payables/:id/installments/:installmentId/pay | Baixa (parcial ou total) | payable:edit |
| POST | /payables/:id/installments/:installmentId/reverse | Estornar baixa | payable:edit |

Body pagamento: { accountId, value (parcial), paidAt }.

---

## Receivables

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | /receivables | Lista (filtros) | receivable:view |
| GET | /receivables/:id | Por id com parcelas | receivable:view |
| POST | /receivables | Criar conta a receber | receivable:edit |
| PATCH | /receivables/:id | Atualizar | receivable:edit |
| POST | /receivables/:id/installments/:installmentId/receive | Baixa | receivable:edit |
| POST | /receivables/:id/installments/:installmentId/reverse | Estornar baixa | receivable:edit |

---

## Reconciliation

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | /reconciliation/statements | Lista extratos (por conta) | reconciliation:view |
| POST | /reconciliation/statements | Importar extrato | reconciliation:edit |
| GET | /reconciliation/statements/:id/lines | Linhas do extrato | reconciliation:view |
| POST | /reconciliation/lines/:lineId/link/:entryId | Vincular linha a lançamento | reconciliation:edit |
| POST | /reconciliation/lines/:lineId/auto-match | Conciliação automática | reconciliation:edit |

---

## Attachments

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| POST | /attachments/upload | Upload (multipart: file, entityType, entityId) | conforme entidade |
| GET | /attachments/:id/signed-url | URL assinada para download | conforme entidade |
| GET | /attachments/entity/:type/:id | Lista anexos da entidade | conforme entidade |
| DELETE | /attachments/:id | Excluir anexo | conforme entidade |

---

## Dashboard

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | /dashboard | Resumo (saldo total, por conta, entradas/saídas, vencidas, a vencer) | dashboard:view |

Query: startDate, endDate (ISO).

---

## Reports

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | /reports/cash-flow | Fluxo de caixa (query: startDate, endDate) | report:view |
| GET | /reports/account-statement | Extrato por conta (accountId, startDate, endDate) | report:view |
| GET | /reports/payables | Contas a pagar | report:view |
| GET | /reports/receivables | Contas a receber | report:view |
| GET | /reports/by-category | Por categoria | report:view |
| GET | /reports/by-cost-center | Por centro de custo | report:view |
| GET | /reports/audit | Auditoria (entityType, entityId, from, to) | report:view / audit:view |
| POST | /reports/request | Solicitar relatório assíncrono (body: type, params) | report:view |
| GET | /reports/jobs/:id | Status e URL do relatório gerado | report:view |

---

## Audit

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | /audit | Lista logs (entityType, entityId, userId, from, to) | audit:view |

---

## Health

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /health | Status da API |
| GET | /health/db | Status do PostgreSQL |
| GET | /health/redis | Status do Redis |

---

*Documento parte do projeto CashFlow SaaS — Etapa 6.*
