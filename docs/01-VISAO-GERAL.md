# ETAPA 1 — Visão Geral da Solução

## 1. Visão do Produto

**CashFlow SaaS** é uma plataforma B2B de controle financeiro de caixa para pequenas e médias empresas (PMEs), oferecida como Software as a Service. O foco é **simplicidade de uso**, **escalabilidade** e **baixo custo inicial**, permitindo que várias empresas (tenants) usem a mesma instância da aplicação com isolamento total de dados.

**Proposta de valor:**
- Um único produto atende múltiplas empresas (multi-tenant).
- Controle de entradas/saídas, contas a pagar e receber, conciliação e relatórios em um só lugar.
- Permissões por perfil (admin, financeiro, gestor, operador) garantem segurança e governança.
- Custo operacional baixo: um banco PostgreSQL compartilhado, schema único, infra enxuta.

---

## 2. Módulos Principais

| Módulo | Responsabilidade |
|--------|------------------|
| **Auth** | Login, refresh token, logout, troca de empresa ativa. |
| **Tenants** | Cadastro e gestão de empresas (tenants). |
| **Users / Roles** | Usuários, perfis e permissões; vínculo usuário–empresa. |
| **Accounts** | Contas bancárias e caixas (múltiplas por tenant). |
| **Categories** | Categorização de receitas e despesas. |
| **Cost Centers** | Centros de custo para análise gerencial. |
| **Customers / Suppliers** | Cadastro de clientes e fornecedores. |
| **Financial Entries** | Lançamentos de entrada/saída, transferências, estornos. |
| **Payables** | Contas a pagar, parcelas, baixa parcial/total. |
| **Receivables** | Contas a receber, parcelas, baixa parcial/total. |
| **Reconciliation** | Conciliação manual e automática (extrato x lançamentos). |
| **Attachments** | Anexos de comprovantes (S3/MinIO, URL assinada). |
| **Dashboard** | Indicadores em tempo (quase) real. |
| **Reports** | Relatórios gerenciais (síncronos e assíncronos). |
| **Audit** | Trilha de auditoria e histórico de alterações. |
| **Notifications** | Alertas (ex.: vencimentos, inadimplência). |
| **Health** | Health check para infra e dependências. |

---

## 3. Fluxo Principal do Usuário

1. **Acesso:** usuário acessa a URL do produto e vê a tela de login.
2. **Login:** informa e-mail e senha; recebe access token + refresh token.
3. **Seleção de empresa:** se estiver em mais de uma empresa, escolhe a empresa ativa (tenant) e o contexto passa a ser filtrado por esse tenant.
4. **Dashboard:** vê saldo consolidado, entradas/saídas do período, contas a pagar/receber vencidas e a vencer.
5. **Operações:** lança receitas/despesas, cria contas a pagar/receber, faz baixas parciais/totais, transferências e conciliação.
6. **Cadastros:** mantém categorias, centros de custo, contas, clientes e fornecedores.
7. **Relatórios:** gera fluxo de caixa, extrato por conta, contas a pagar/receber, por categoria, centro de custo e auditoria.
8. **Configurações:** usuário admin gerencia usuários, perfis e configurações da empresa.

---

## 4. Arquitetura Técnica Geral

- **Monolito modular:** um único deploy (backend + workers no mesmo processo ou em containers separados), com módulos bem definidos (auth, tenants, users, accounts, financial-entries, etc.).
- **Backend:** NestJS com Fastify, TypeScript, Prisma (PostgreSQL), Redis + BullMQ para filas e cache.
- **Frontend:** React + TypeScript + Vite, organizado por módulos de negócio.
- **Multi-tenant:** banco compartilhado, schema compartilhado, coluna `tenant_id` em todas as tabelas de negócio; isolamento por aplicação e preparado para RLS no futuro.
- **API:** REST documentada com Swagger/OpenAPI.
- **Infra:** Docker + Docker Compose (PostgreSQL, Redis, MinIO, backend, frontend).

---

## 5. Decisão de Multi-Tenant e Motivo

- **Modelo:** banco PostgreSQL **compartilhado** com **schema compartilhado** e **tenant_id** em todas as tabelas de negócio.
- **Motivos:**
  - **Custo:** um único banco para todas as PMEs reduz custo de infra e operação.
  - **Manutenção:** um único schema facilita migrations e evolução do produto.
  - **Escalabilidade inicial:** suficiente para centenas de tenants; depois é possível evoluir para read replicas, connection pooling (PgBouncer) e, para clientes enterprise, isolamento maior (schema por tenant ou banco dedicado).
- **Isolamento:** garantido na aplicação (sempre filtrar e inserir por `tenant_id`), com código preparado para ativar Row-Level Security (RLS) no PostgreSQL quando necessário.

---

## 6. Estratégia de Autenticação e Autorização

- **Autenticação:**
  - Login com e-mail e senha.
  - Senha com hash **Argon2**.
  - **Access token** JWT de curta duração (ex.: 15 min).
  - **Refresh token** armazenado (ex.: em tabela `sessions` ou Redis), rotativo, com expiração maior (ex.: 7 dias).
  - Logout invalida refresh token e opcionalmente blacklist do access token (se necessário).
- **Autorização:**
  - Usuário vinculado a uma ou mais empresas via `tenant_users` (com role por empresa).
  - **Empresa ativa** escolhida na sessão (claim no JWT ou header/body) e validada em middleware/guard.
  - **Guards:** (1) JWT obrigatório nas rotas protegidas; (2) tenant ativo válido para o usuário; (3) permissão por role (admin, financeiro, gestor, operador) para cada recurso.
- **Fluxo de troca de empresa:** endpoint que recebe `tenant_id`, valida se o usuário pertence ao tenant e retorna novo access token (ou atualiza claims) com o tenant ativo.

---

## 7. Por Que Essa Stack Foi Escolhida

| Tecnologia | Motivo |
|------------|--------|
| **Node.js + TypeScript** | Ecossistema maduro, um idioma no front e back, tipagem e produtividade. |
| **NestJS + Fastify** | Estrutura modular, injeção de dependência, fácil integração com Prisma, Fastify para performance. |
| **React + Vite** | Componentes, ecossistema rico, Vite para build rápido e DX. |
| **PostgreSQL** | ACID, JSON, RLS para multi-tenant futuro, decimal para valores monetários. |
| **Prisma** | ORM type-safe, migrations claras, suporte a múltiplos bancos se no futuro precisar. |
| **Redis + BullMQ** | Cache e filas para relatórios pesados, notificações e jobs assíncronos. |
| **S3/MinIO** | Anexos escaláveis; MinIO replica S3 localmente em dev. |
| **JWT + refresh** | Stateless para API, refresh rotativo aumenta segurança. |
| **Zod/class-validator** | Validação declarativa e consistente nos DTOs. |
| **Pino** | Logs estruturados e performáticos. |
| **Swagger** | Documentação viva da API e geração de clientes. |
| **Docker** | Ambiente reproduzível e deploy containerizado. |

---

*Documento parte do projeto CashFlow SaaS — Etapa 1.*
