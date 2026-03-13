# ETAPA 3 — Estrutura do Backend

Cada módulo do backend segue a organização: **controller** (interface HTTP), **service** (casos de uso), **repositories** (opcional, acesso a dados), **DTOs** e **validações** (class-validator/Zod), **guards** e **policies** (autorização).

---

## auth

**Responsabilidade:** Autenticação (login, refresh, logout) e emissão de tokens.

**Entidades:** Usuário (referência), Session (refresh token).

**Casos de uso:** Login (email/senha → access + refresh), Refresh token, Logout, Troca de tenant ativo.

**Controllers:** `AuthController` — POST /login, POST /refresh, POST /logout, POST /switch-tenant.

**Services:** `AuthService` — validateUser, login, refresh, logout, switchTenant.

**Repositories:** Uso de `UsersService` e tabela de sessions (Prisma).

**DTOs:** LoginDto, RefreshTokenDto, SwitchTenantDto; resposta com accessToken, refreshToken, user, tenant.

**Validações:** email, password obrigatórios; refreshToken presente.

**Guards e policies:** Nenhum dentro do auth (rota pública); JwtAuthGuard e JwtStrategy usados nos outros módulos.

---

## tenants

**Responsabilidade:** CRUD de empresas (tenants) e listagem para o usuário.

**Entidades:** Tenant.

**Casos de uso:** Listar tenants do usuário, Criar tenant (admin plataforma), Atualizar tenant, Obter por id.

**Controllers:** `TenantsController` — GET / (meus), GET /:id, POST /, PATCH /:id.

**Services:** `TenantsService` — findAllByUser, findOne, create, update.

**Repositories:** Prisma `tenant.findMany` com filtro por usuário via tenant_users.

**DTOs:** CreateTenantDto, UpdateTenantDto, TenantResponseDto.

**Validações:** name, slug; slug único.

**Guards e policies:** JwtAuthGuard, TenantGuard (opcional), PermissionGuard(tenant:view, tenant:edit).

---

## users

**Responsabilidade:** CRUD de usuários e vínculo com tenants (tenant_users).

**Entidades:** User, TenantUser.

**Casos de uso:** Listar usuários do tenant, Criar usuário no tenant, Atualizar usuário, Atribuir role no tenant, Remover do tenant.

**Controllers:** `UsersController` — GET / (do tenant), GET /:id, POST /, PATCH /:id, POST /:id/tenant/:tenantId/role, DELETE /:id/tenant/:tenantId.

**Services:** `UsersService` — findByTenant, findOne, create, update, setRoleInTenant, removeFromTenant.

**Repositories:** Prisma user, tenant_user.

**DTOs:** CreateUserDto, UpdateUserDto, UserResponseDto, SetRoleDto.

**Validações:** email único, role válido, tenantId UUID.

**Guards e policies:** JwtAuthGuard, TenantGuard, PermissionGuard(user:view, user:edit).

---

## roles

**Responsabilidade:** Perfis (roles) e permissões; listagem para atribuição.

**Entidades:** Role, Permission, RolePermission.

**Casos de uso:** Listar roles, Listar permissões, Obter role com permissões.

**Controllers:** `RolesController` — GET /, GET /:id, GET /permissions.

**Services:** `RolesService` — findAll, findOne, getPermissions.

**Repositories:** Prisma role, permission, role_permission.

**DTOs:** RoleResponseDto, PermissionResponseDto.

**Guards e policies:** JwtAuthGuard, PermissionGuard(tenant:view ou user:view).

---

## accounts

**Responsabilidade:** Contas bancárias e caixas do tenant.

**Entidades:** Account (tenant_id, type: bank | cash, name, etc.).

**Casos de uso:** Listar contas do tenant, Criar, Atualizar, Excluir (soft delete), Obter saldo.

**Controllers:** `AccountsController` — GET /, GET /:id, GET /:id/balance, POST /, PATCH /:id, DELETE /:id.

**Services:** `AccountsService` — findAll, findOne, create, update, remove, getBalance (soma de movimentações liquidadas).

**Repositories:** Prisma account; saldo via financial_entries ou view.

**DTOs:** CreateAccountDto, UpdateAccountDto, AccountResponseDto.

**Validações:** name, type enum; tenant_id do context.

**Guards e policies:** JwtAuthGuard, TenantGuard, PermissionGuard(account:view, account:edit).

---

## categories

**Responsabilidade:** Categorias financeiras (receita/despesa) do tenant.

**Entidades:** Category (tenant_id, name, type: income | expense).

**Casos de uso:** Listar, Criar, Atualizar, Excluir (soft delete).

**Controllers:** `CategoriesController` — GET /, GET /:id, POST /, PATCH /:id, DELETE /:id.

**Services:** `CategoriesService` — findAll, findOne, create, update, remove.

**DTOs:** CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto.

**Validações:** name, type; tenant_id do context.

**Guards e policies:** JwtAuthGuard, TenantGuard, PermissionGuard(category:view, category:edit).

---

## cost-centers

**Responsabilidade:** Centros de custo do tenant.

**Entidades:** CostCenter (tenant_id, name, code opcional).

**Casos de uso:** Listar, Criar, Atualizar, Excluir (soft delete).

**Controllers:** `CostCentersController` — GET /, GET /:id, POST /, PATCH /:id, DELETE /:id.

**Services:** `CostCentersService` — findAll, findOne, create, update, remove.

**DTOs:** CreateCostCenterDto, UpdateCostCenterDto, CostCenterResponseDto.

**Guards e policies:** JwtAuthGuard, TenantGuard, PermissionGuard(cost_center:view, cost_center:edit).

---

## customers

**Responsabilidade:** Cadastro de clientes do tenant.

**Entidades:** Customer (tenant_id, name, document, email, etc.).

**Casos de uso:** Listar, Criar, Atualizar, Excluir (soft delete).

**Controllers:** `CustomersController` — GET /, GET /:id, POST /, PATCH /:id, DELETE /:id.

**Services:** `CustomersService` — findAll, findOne, create, update, remove.

**DTOs:** CreateCustomerDto, UpdateCustomerDto, CustomerResponseDto.

**Guards e policies:** JwtAuthGuard, TenantGuard, PermissionGuard(customer:view, customer:edit).

---

## suppliers

**Responsabilidade:** Cadastro de fornecedores do tenant.

**Entidades:** Supplier (tenant_id, name, document, etc.).

**Casos de uso:** Listar, Criar, Atualizar, Excluir (soft delete).

**Controllers:** `SuppliersController` — GET /, GET /:id, POST /, PATCH /:id, DELETE /:id.

**Services:** `SuppliersService` — findAll, findOne, create, update, remove.

**DTOs:** CreateSupplierDto, UpdateSupplierDto, SupplierResponseDto.

**Guards e policies:** JwtAuthGuard, TenantGuard, PermissionGuard(supplier:view, supplier:edit).

---

## financial-entries

**Responsabilidade:** Lançamentos de entrada, saída e transferência; estorno.

**Entidades:** FinancialEntry (tenant_id, account_id, category_id, type, value, competence_date, settled_at, parent_id para estorno).

**Casos de uso:** Criar receita, Criar despesa, Criar transferência (duas entradas: saída origem, entrada destino), Estornar (criar lançamento reverso com parent_id), Listar com filtros (conta, período, tipo), Obter por id.

**Controllers:** `FinancialEntriesController` — GET /, GET /:id, POST /, POST /transfer, POST /:id/reverse.

**Services:** `FinancialEntriesService` — create, createTransfer, reverse, findAll, findOne; regras de saldo e liquidação.

**Repositories:** Prisma financial_entry; sempre filtrar tenant_id.

**DTOs:** CreateEntryDto, CreateTransferDto, EntryResponseDto, ListEntriesQueryDto.

**Validações:** value > 0, account e category do tenant, datas competência/vencimento/liquidação.

**Guards e policies:** JwtAuthGuard, TenantGuard, PermissionGuard(entry:view, entry:edit).

---

## payables

**Responsabilidade:** Contas a pagar e parcelas; baixa parcial e total.

**Entidades:** Payable, PayableInstallment (tenant_id, payable_id, due_date, amount, paid_amount, settled_at).

**Casos de uso:** Criar conta a pagar (com parcelas), Listar (filtros: vencidas, a vencer, fornecedor), Baixa parcial em parcela, Quitação total, Estornar baixa.

**Controllers:** `PayablesController` — GET /, GET /:id, POST /, PATCH /:id, POST /:id/installments/:installmentId/pay, POST /:id/installments/:installmentId/reverse.

**Services:** `PayablesService` — create (com parcelas), findAll, findOne, payInstallment (parcial/total), reversePayment.

**DTOs:** CreatePayableDto, PayInstallmentDto, PayableResponseDto, PayableInstallmentDto.

**Validações:** Valor, datas, paid_amount <= amount; geração de financial_entry na baixa.

**Guards e policies:** JwtAuthGuard, TenantGuard, PermissionGuard(payable:view, payable:edit).

---

## receivables

**Responsabilidade:** Contas a receber e parcelas; baixa parcial e total.

**Entidades:** Receivable, ReceivableInstallment (tenant_id, receivable_id, due_date, amount, received_amount, settled_at).

**Casos de uso:** Criar conta a receber (parcelas), Listar (filtros), Baixa parcial/total, Estornar baixa.

**Controllers:** `ReceivablesController` — GET /, GET /:id, POST /, PATCH /:id, POST /:id/installments/:installmentId/receive, POST /:id/installments/:installmentId/reverse.

**Services:** `ReceivablesService` — create, findAll, findOne, receiveInstallment, reversePayment.

**DTOs:** CreateReceivableDto, ReceiveInstallmentDto, ReceivableResponseDto.

**Guards e policies:** JwtAuthGuard, TenantGuard, PermissionGuard(receivable:view, receivable:edit).

---

## reconciliation

**Responsabilidade:** Conciliação manual e automática (extrato x lançamentos).

**Entidades:** BankStatement, StatementLine, Reconciliation (statement_line_id, financial_entry_id).

**Casos de uso:** Importar extrato (upload ou linhas), Listar linhas por conta/período, Conciliação manual (vincular linha a lançamento), Conciliação automática (por valor e data), Listar conciliações.

**Controllers:** `ReconciliationController` — GET /statements, POST /statements, GET /statements/:id/lines, POST /lines/:lineId/link/:entryId, POST /lines/:lineId/auto-match, GET /.

**Services:** `ReconciliationService` — importStatement, getLines, linkLineToEntry, autoMatch, listReconciliations.

**DTOs:** ImportStatementDto, StatementLineDto, ReconciliationDto.

**Guards e policies:** JwtAuthGuard, TenantGuard, PermissionGuard(reconciliation:view, reconciliation:edit).

---

## attachments

**Responsabilidade:** Upload e download de anexos (comprovantes); S3/MinIO; URL assinada para download.

**Entidades:** Attachment (tenant_id, entity_type, entity_id, file_key, filename, content_type, size).

**Casos de uso:** Upload (multipart), Gerar URL assinada para download, Listar anexos de uma entidade, Excluir anexo.

**Controllers:** `AttachmentsController` — POST /upload, GET /:id/signed-url, GET /entity/:type/:id, DELETE /:id.

**Services:** `AttachmentsService` — upload (S3), getSignedUrl, findByEntity, remove.

**DTOs:** AttachmentResponseDto; entity_type e entity_id no upload.

**Guards e policies:** JwtAuthGuard, TenantGuard; verificar se entidade pertence ao tenant.

---

## dashboard

**Responsabilidade:** Agregações para o dashboard (saldo total, por conta, entradas/saídas período, contas a pagar/receber vencidas e a vencer, etc.).

**Entidades:** Nenhuma própria; lê de accounts, financial_entries, payables, receivables.

**Casos de uso:** Obter indicadores do período (query params: startDate, endDate).

**Controllers:** `DashboardController` — GET / (retorna todos os indicadores ou por seção).

**Services:** `DashboardService` — getSummary(tenantId, startDate, endDate); saldo por conta, totais, listas de vencidas/a vencer.

**DTOs:** DashboardSummaryDto.

**Guards e policies:** JwtAuthGuard, TenantGuard, PermissionGuard(dashboard:view).

---

## reports

**Responsabilidade:** Relatórios gerenciais (fluxo de caixa, extrato, contas a pagar/receber, por categoria, centro de custo, auditoria). Síncronos para listagens pequenas; assíncronos (BullMQ) para relatórios pesados com geração de arquivo.

**Entidades:** Nenhuma própria; lê de várias tabelas; job de report pode gravar ReportJob (id, tenant_id, type, status, file_key).

**Casos de uso:** Fluxo de caixa (período) — síncrono ou assíncrono; Extrato por conta — síncrono; Contas a pagar/receber — síncrono; Por categoria / centro de custo — síncrono; Auditoria — síncrono com paginação; Relatório pesado — enfileirar job, retornar job_id; GET /jobs/:id para status e URL do arquivo.

**Controllers:** `ReportsController` — GET /cash-flow, GET /account-statement, GET /payables, GET /receivables, GET /by-category, GET /by-cost-center, GET /audit, POST /request (assíncrono), GET /jobs/:id.

**Services:** `ReportsService` — cashFlowReport, accountStatementReport, payablesReport, receivablesReport, byCategoryReport, byCostCenterReport, auditReport; enqueueReportJob, getJobStatus.

**Guards e policies:** JwtAuthGuard, TenantGuard, PermissionGuard(report:view).

---

## audit

**Responsabilidade:** Trilha de auditoria e histórico de alterações.

**Entidades:** AuditLog (tenant_id, entity_type, entity_id, action, old_value, new_value, user_id, created_at).

**Casos de uso:** Registrar alteração (chamado por outros serviços), Listar logs com filtros (entidade, período, usuário).

**Controllers:** `AuditController` — GET / (query: entityType, entityId, userId, from, to).

**Services:** `AuditService` — log(action, entityType, entityId, oldValue, newValue, userId), findAll.

**DTOs:** AuditLogResponseDto.

**Guards e policies:** JwtAuthGuard, TenantGuard, PermissionGuard(audit:view).

---

## notifications

**Responsabilidade:** Envio de notificações (ex.: vencimentos, inadimplência). Pode usar fila BullMQ e no MVP apenas preparar interface (e-mail ou in-app depois).

**Entidades:** Opcional: Notification (tenant_id, user_id, type, read_at).

**Casos de uso:** Disparar job de verificação de vencimentos; Enviar e-mail ou criar notificação in-app.

**Controllers:** Nenhum no MVP ou GET /notifications (lista do usuário).

**Services:** `NotificationsService` — scheduleDueReminders, send (abstração para e-mail/push).

**Guards e policies:** JwtAuthGuard, TenantGuard.

---

## health

**Responsabilidade:** Health check para load balancer e monitoramento.

**Entidades:** Nenhuma.

**Casos de uso:** GET /health retorna status da API; opcional: GET /health/db, /health/redis para dependências.

**Controllers:** `HealthController` — GET /, GET /db, GET /redis.

**Services:** Opcional HealthService que verifica Prisma.$queryRaw e Redis.ping.

**Guards e policies:** Nenhum (rota pública ou interna).

---

*Documento parte do projeto CashFlow SaaS — Etapa 3.*
