# ETAPA 5 — Modelagem de Dados

## Convenções

- **PK:** UUID (`@default(uuid())`).
- **Multi-tenant:** Todas as tabelas de negócio têm `tenantId` e relação com `Tenant`.
- **Colunas comuns:** `id`, `tenantId` (quando aplicável), `createdAt`, `updatedAt`, `deletedAt` (soft delete onde fizer sentido).
- **Valores monetários:** `Decimal(19, 4)` no Prisma (`@db.Decimal(19, 4)`).
- **Datas:** `competenceDate`, `dueDate`, `settledAt` separados; uso de `@db.Date` quando só a data importa.

## Diagrama textual (principais entidades)

```
Tenant 1----* TenantUser *----1 User
Tenant 1----* Account
Tenant 1----* Category
Tenant 1----* CostCenter
Tenant 1----* Customer
Tenant 1----* Supplier
Tenant 1----* FinancialEntry
Tenant 1----* Payable 1----* PayableInstallment
Tenant 1----* Receivable 1----* ReceivableInstallment
Tenant 1----* BankStatement 1----* StatementLine
Tenant 1----* Attachment
Tenant 1----* AuditLog
Tenant 1----* RecurrenceRule

User 1----* Session
Role 1----* RolePermission *----1 Permission
TenantUser *----1 Role

Account 1----* FinancialEntry (accountId)
Category 1----* FinancialEntry
FinancialEntry *----1 FinancialEntry (parentId, estorno)
StatementLine 1----1 Reconciliation 1----1 FinancialEntry
PayableInstallment *----1 FinancialEntry (baixa)
ReceivableInstallment *----1 FinancialEntry (baixa)
```

## Tabelas

| Tabela | Descrição |
|--------|-----------|
| tenants | Empresas (tenants) |
| users | Usuários do sistema |
| tenant_users | Vínculo usuário–tenant com role |
| roles | Perfis (admin, financeiro, gestor, operador) |
| permissions | Permissões (entry:view, etc.) |
| role_permissions | Permissões por role |
| sessions | Refresh tokens |
| accounts | Contas bancárias e caixas |
| categories | Categorias (receita/despesa) |
| cost_centers | Centros de custo |
| customers | Clientes |
| suppliers | Fornecedores |
| financial_entries | Lançamentos (receita, despesa, transferência, estorno) |
| payables | Contas a pagar |
| payable_installments | Parcelas a pagar |
| receivables | Contas a receber |
| receivable_installments | Parcelas a receber |
| bank_statements | Extratos importados |
| statement_lines | Linhas do extrato |
| reconciliations | Vínculo linha do extrato ↔ lançamento |
| attachments | Anexos (entityType + entityId + fileKey) |
| audit_logs | Trilha de auditoria |
| recurrence_rules | Regras de recorrência |

## Índices recomendados

- `(tenant_id)` em todas as tabelas de negócio.
- `(tenant_id, account_id)`, `(tenant_id, competence_date)`, `(tenant_id, settled_at)` em `financial_entries`.
- `(tenant_id, status)` em `payables` e `receivables`.
- `(tenant_id, entity_type, entity_id)` em `attachments` e `audit_logs`.
- `(tenant_id, created_at)` em `audit_logs`.
- `(user_id)` em `sessions` e `tenant_users`.
- `(refresh_token)` único em `sessions`.

## Constraints

- Unique: `(tenant_id, user_id)` em `tenant_users`; `slug` em `tenant`, `role`, `permission`; `refresh_token` em `sessions`.
- FK com `onDelete: Cascade` onde fizer sentido (ex.: tenant → accounts).
- Valores monetários sempre positivos nas parcelas; `paid_amount`/`received_amount` ≤ `amount`; estorno via `parent_id` em `financial_entries` (não apagar liquidados).

O schema completo está em `apps/backend/prisma/schema.prisma`.

---

*Documento parte do projeto CashFlow SaaS — Etapa 5.*
