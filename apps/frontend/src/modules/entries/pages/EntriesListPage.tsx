import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEntries, createEntry, type FinancialEntry } from '../../../api/entries';
import { fetchAccounts } from '../../../api/accounts';
import { fetchCategories } from '../../../api/categories';

export function EntriesListPage() {
  const [accountId, setAccountId] = useState('');
  const [form, setForm] = useState({
    accountId: '',
    categoryId: '',
    type: 'expense' as 'income' | 'expense',
    value: 0,
    description: '',
    competenceDate: new Date().toISOString().slice(0, 10),
  });
  const [showForm, setShowForm] = useState(false);
  const client = useQueryClient();
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['entries', accountId],
    queryFn: () => fetchEntries(accountId ? { accountId } : undefined),
  });
  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: fetchAccounts });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const createMut = useMutation({
    mutationFn: createEntry,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['entries'] });
      setShowForm(false);
      setForm({
        accountId: (form.accountId || accounts[0]?.id) ?? '',
        categoryId: '',
        type: 'expense',
        value: 0,
        description: '',
        competenceDate: new Date().toISOString().slice(0, 10),
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.accountId && form.categoryId && form.value > 0) {
      createMut.mutate({
        accountId: form.accountId,
        categoryId: form.categoryId,
        type: form.type,
        value: form.value,
        description: form.description || undefined,
        competenceDate: form.competenceDate,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600" />
        Carregando...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Lançamentos financeiros</h1>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-slate-600">Filtrar por conta</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">Todas</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
          >
            {showForm ? 'Fechar formulário' : 'Novo lançamento'}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Novo lançamento</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Conta</label>
              <select
                value={form.accountId}
                onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Selecione</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Categoria</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Selecione</option>
                {categories.filter((c) => c.type === form.type).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tipo</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'income' | 'expense' }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Valor</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.value || ''}
                onChange={(e) => setForm((f) => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Competência</label>
              <input
                type="date"
                value={form.competenceDate}
                onChange={(e) => setForm((f) => ({ ...f, competenceDate: e.target.value }))}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Descrição</label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Opcional"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createMut.isPending}
            className="mt-4 rounded-lg bg-teal-600 px-4 py-2 font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
          >
            Salvar
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Data</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Conta</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Categoria</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Tipo</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {entries.map((e: FinancialEntry) => (
                <tr key={e.id} className="hover:bg-slate-50/50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{e.competenceDate}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{e.account?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{e.category?.name ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${e.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {e.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 text-right text-sm font-medium ${e.type === 'income' ? 'text-emerald-700' : 'text-red-700'}`}>
                    R$ {Number(e.value ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{e.description ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {entries.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-500">Nenhum lançamento.</div>
        )}
      </div>
    </div>
  );
}
