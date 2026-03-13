# ETAPA 13 — Prioridade de Implementação

## Fase MVP

**Implementar primeiro:**
- Auth (login, refresh, logout, JWT, Argon2, sessions).
- Tenant context (tenantId no token, guard, listagem de tenants do usuário, switch-tenant).
- CRUD de categorias e contas (accounts).
- Lançamentos financeiros (receita/despesa, listagem com filtros).
- Dashboard básico (saldo total, saldo por conta, entradas/saídas do mês).
- Permissões por role (guards, seeds de roles e permissions).

**Simplificado no MVP:**
- Conciliação: apenas estrutura de dados e tela simples (conciliação manual só).
- Relatórios: apenas fluxo de caixa e extrato por conta (síncronos).
- Recorrência: campo no modelo; geração de parcelas automática em fase 2.
- Notificações: sem envio de e-mail; apenas estrutura.

**Ainda não automatizar:**
- Conciliação automática (match por valor/data).
- Jobs de relatório pesado (fila).
- Lembretes de vencimento (cron).

## Fase 2

- Contas a pagar e a receber completas (parcelas, baixa parcial/total, estorno).
- Conciliação manual completa e importação de extrato.
- Relatórios: contas a pagar/receber, por categoria, centro de custo; exportação CSV/PDF em fila.
- Anexos (upload S3, URL assinada).
- Recorrência (geração de lançamentos por regra).
- Ajustes de permissões (gestor aprovar, etc.).

## Fase 3

- Conciliação automática.
- Notificações (e-mail, in-app).
- Relatórios avançados e dashboards customizáveis.
- Tenants enterprise (isolamento maior: schema ou banco dedicado).
- Auditoria expandida e relatório de auditoria.
- Performance: cache (Redis), índices, read replicas.

---

*Documento parte do projeto CashFlow SaaS — Etapa 13.*
