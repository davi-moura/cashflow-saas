# ETAPA 8 — Fluxos Críticos do Sistema

## 1. Lançamento de receita

- Dados: accountId, categoryId, value, competenceDate, description, opcional costCenterId/customerId.
- Regras: value > 0; account e category do tenant; competência obrigatória.
- Cria `FinancialEntry` com type=income, settledAt=now (ou null se “a receber”).
- Atualiza saldo: saldo da conta = soma(entries liquidadas onde accountId e settledAt não null).
- Auditoria: AuditLog create.

## 2. Lançamento de despesa

- Idem com type=expense; value > 0; pode ter supplierId.
- Saldo: diminui quando liquidado.

## 3. Criação de conta a pagar

- Dados: supplierId, description, totalValue, parcelas (dueDate + amount por parcela) ou data única.
- Cria `Payable` e N `PayableInstallment`; status=open.
- Não gera lançamento até baixa; auditoria create.

## 4. Criação de conta a receber

- Idem com `Receivable` e `ReceivableInstallment`; customerId opcional.

## 5. Baixa parcial (conta a pagar)

- Parcela: paidAmount + value ≤ amount; atualiza paidAmount; se paidAmount = amount, settledAt=now, status da parcela pago.
- Cria `FinancialEntry` type=expense com valor da baixa, accountId, settledAt=now; vincula PayableInstallment.financialEntryId.
- Atualiza status do Payable (partial ou paid) conforme parcelas.
- Transação única; auditoria.

## 6. Quitação total

- Baixa o valor restante da parcela (ou todas); mesma lógica da baixa parcial; status paid.

## 7. Transferência entre contas

- Cria dois lançamentos na mesma transação: type=transfer_out (conta origem, value negativo ou valor positivo com tipo que diminui saldo) e type=transfer_in (conta destino). Ou: um com valor negativo na origem e um positivo no destino; saldo = soma por conta considerando sinal.
- Convenção: transfer_out e transfer_in com mesmo transferPairId; value positivo em ambos; saldo origem -= value, saldo destino += value.
- settledAt=now em ambos; auditoria.

## 8. Conciliação manual

- Usuário escolhe uma linha do extrato (StatementLine) e um lançamento (FinancialEntry).
- Cria `Reconciliation(statementLineId, financialEntryId)`; opcionalmente marca StatementLine como conciliada.
- Não altera valores; apenas vínculo.

## 9. Conciliação automática básica

- Para uma conta e período: busca StatementLine não conciliadas e FinancialEntry não conciliados com mesmo valor e data próxima (ex.: ±3 dias). Cria Reconciliation para pares encontrados; pode exigir confirmação ou fazer em lote.

## 10. Estorno

- Não apaga o lançamento liquidado. Cria novo `FinancialEntry` com type igual ao original mas valor reverso (negativo ou tipo “estorno”), parentId=id do lançamento estornado, mesma conta/categoria, settledAt=now. Saldo fica corrigido pela soma dos dois.

## 11. Fechamento de caixa

- Pode ser um relatório por conta e data: lista movimentações do dia, saldo anterior, saldo final. Não altera dados; apenas leitura e eventual export.

## 12. Geração de relatório

- Síncrono: queries agregadas, retorno JSON (ex.: fluxo de caixa por período).
- Assíncrono: job na fila (BullMQ), gera arquivo (ex.: CSV/PDF), grava em S3; retorna jobId; cliente consulta GET /reports/jobs/:id para status e URL assinada.

---

*Documento parte do projeto CashFlow SaaS — Etapa 8.*
