# ETAPA 4 — Estrutura do Frontend

## Estrutura de rotas

| Rota | Módulo | Descrição |
|------|--------|-----------|
| /login | auth | Login |
| /select-tenant | auth | Seleção de empresa (se múltiplas) |
| / | dashboard | Dashboard |
| /entries | entries | Lançamentos financeiros (listagem, filtros, criar) |
| /entries/new | entries | Novo lançamento |
| /entries/:id | entries | Editar lançamento (se permitido) |
| /payables | payables | Contas a pagar |
| /payables/new | payables | Nova conta a pagar |
| /payables/:id | payables | Detalhe e baixas |
| /receivables | receivables | Contas a receber |
| /receivables/new | receivables | Nova conta a receber |
| /receivables/:id | receivables | Detalhe e baixas |
| /reconciliation | reconciliation | Conciliação (por conta) |
| /accounts | accounts | Contas bancárias e caixas |
| /accounts/new | accounts | Nova conta |
| /accounts/:id | accounts | Editar conta |
| /customers | customers | Clientes |
| /suppliers | suppliers | Fornecedores |
| /categories | categories | Categorias |
| /cost-centers | cost-centers | Centros de custo |
| /users | users | Usuários e permissões (admin) |
| /reports | reports | Relatórios |
| /reports/:type | reports | Relatório específico |
| /settings | settings | Configurações da empresa |

Rotas protegidas: todas exceto /login (e /select-tenant quando implementado). Guard de rota redireciona para /login se não autenticado.

---

## Organização dos componentes

- **src/components/** — Botões, inputs, tabelas, cards, modais, loading, erro (reutilizáveis).
- **src/layouts/** — AuthLayout (login), MainLayout (sidebar + header + outlet), ReportLayout se necessário.
- **src/modules/<modulo>/** — Por módulo de negócio:
  - **pages/** — Páginas (ListPage, DetailPage, FormPage).
  - **components/** — Componentes específicos do módulo (ex.: EntriesTable, PayableFilters).
  - **hooks/** — useEntries, usePayables, useCategories, etc. (TanStack Query).
  - **api/** — Funções que chamam os endpoints do módulo (opcional, ou centralizado em api/).
  - **types.ts** — Tipos do módulo.
  - **schemas.ts** — Schemas Zod para formulários.

---

## TanStack Query

- **Queries:** Listagens (useQuery com key: ['entries', tenantId, filters]), detalhes (['entry', id]), dashboard (['dashboard', tenantId, period]).
- **Mutations:** Criar/atualizar/excluir (useMutation com onSuccess invalidateQueries).
- **Client:** Configurado em main.tsx (QueryClientProvider); baseURL e interceptors no cliente HTTP (token no header, refresh em 401).

---

## Formulários com React Hook Form

- **useForm** com resolver: **zodResolver(schema)** (Zod).
- Campos controlados com **Controller** ou **register**; componentes em **components/** (Input, Select, DatePicker) encapsulando estilos e erro.
- Validações no schema Zod (required, min, max, email, etc.).

---

## Validações

- Zod no frontend para DTOs de formulário (CreateEntrySchema, CreateCategorySchema, etc.).
- Mensagens de erro em português; exibir errors do react-hook-form no UI.

---

## Layouts

- **AuthLayout:** Centralizado, sem sidebar; apenas Outlet para login (e seleção de tenant).
- **MainLayout:** Sidebar com links por permissão (ocultar links que o usuário não pode acessar), header com nome do tenant, usuário e logout; Outlet para conteúdo.

---

## Componentes reutilizáveis

- **Button**, **Input**, **Select**, **DateInput**, **CurrencyInput**
- **DataTable** (com ordenação e paginação)
- **Card**, **Badge**, **Modal**, **ConfirmDialog**
- **LoadingSpinner**, **ErrorMessage**, **EmptyState**
- **ProtectedRoute** (usa useAuth e redireciona)
- **PermissionGate** (esconde ou desabilita por permissão)

---

## Controle de acesso no frontend

- **Guard de rota:** Componente que verifica isAuthenticated; se não, redireciona para /login. Usado no roteador.
- **Permissões:** Lista de permissões do usuário (ou role) vinda no login ou em GET /me; armazenada no AuthProvider.
- **PermissionGate:** Recebe permission string; se usuário não tiver, não renderiza filhos ou mostra “Sem permissão”. Usado em botões (ex.: “Excluir”) e em links do menu (ocultar “Usuários” se não tiver user:view).
- **Backend é a fonte da verdade:** Frontend apenas esconde/desabilita; todas as ações são revalidadas no backend.

---

*Documento parte do projeto CashFlow SaaS — Etapa 4.*
