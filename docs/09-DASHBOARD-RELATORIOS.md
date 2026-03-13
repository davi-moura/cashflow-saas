# ETAPA 9 — Dashboard e Relatórios

## Dashboard (MVP)

Indicadores (todos no contexto do tenant e período opcional):

- **Saldo total consolidado:** Soma do saldo de todas as contas (saldo = soma movimentações liquidadas por conta).
- **Saldo por conta:** Lista (accountId, name, balance).
- **Entradas no período:** Soma de entries type income com settledAt no período (ou competenceDate).
- **Saídas no período:** Soma de entries type expense (e transfer_out se for saída da visão consolidada).
- **Contas a pagar vencidas:** Parcelas com dueDate < hoje e paidAmount < amount.
- **Contas a receber vencidas:** Idem para receivables.
- **Contas a pagar a vencer:** Parcelas com dueDate entre hoje e fim do período (ex.: 30 dias).
- **Contas a receber a vencer:** Idem.
- **Despesas por categoria:** Agregação por categoryId (e nome) no período.
- **Fluxo de caixa projetado:** Saldo atual + entradas esperadas (receivables a vencer) − saídas esperadas (payables a vencer) por período (semanal/mensal).

Implementação: endpoint GET /dashboard?startDate=&endDate=; queries agregadas; resposta única JSON. **Síncrono.**

## Relatórios iniciais

| Relatório | Descrição | Síncrono/Assíncrono |
|-----------|-----------|---------------------|
| Fluxo de caixa por período | Entradas/saídas/saldo por dia ou mês no intervalo | Síncrono (dados leves) ou assíncrono (PDF/Excel) |
| Extrato por conta | Lista de lançamentos da conta no período | Síncrono |
| Contas a pagar | Lista com filtros (status, vencimento) | Síncrono |
| Contas a receber | Idem | Síncrono |
| Despesas por categoria | Agregado por categoria no período | Síncrono |
| Receitas por categoria | Idem | Síncrono |
| Centro de custo | Agregado por cost_center no período | Síncrono |
| Auditoria de alterações | Lista de AuditLog com filtros | Síncrono (paginado) |

- **Síncronos:** Resposta direta em JSON; listagens com paginação quando grande.
- **Assíncronos:** Relatórios pesados ou exportação (PDF/Excel): enfileirar job (BullMQ), processar em background, gravar arquivo no S3, retornar URL assinada via GET /reports/jobs/:id.

---

*Documento parte do projeto CashFlow SaaS — Etapa 9.*
