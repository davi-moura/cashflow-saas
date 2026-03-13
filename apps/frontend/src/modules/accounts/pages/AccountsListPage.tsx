import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAccounts, createAccount, updateAccount, deleteAccount, type Account } from '../../../api/accounts';

export function AccountsListPage() {
  const [form, setForm] = useState<Partial<Account> & { name: string }>({ name: '', type: 'cash' });
  const [editing, setEditing] = useState<Account | null>(null);
  const client = useQueryClient();
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  });
  const createMut = useMutation({
    mutationFn: (body: Parameters<typeof createAccount>[0]) => createAccount(body),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['accounts'] }); setForm({ name: '', type: 'cash' }); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateAccount>[1] }) => updateAccount(id, body),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['accounts'] }); setEditing(null); },
  });
  const deleteMut = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => client.invalidateQueries({ queryKey: ['accounts'] }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name?.trim()) createMut.mutate({
      name: form.name.trim(),
      type: form.type ?? 'cash',
      bankCode: form.bankCode,
      agency: form.agency,
      accountNumber: form.accountNumber,
    });
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
      <h1 className="text-2xl font-bold text-slate-800">Contas bancárias e caixas</h1>

      <form
        onSubmit={handleCreate}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="min-w-[180px]">
          <label className="mb-1 block text-xs font-medium text-slate-500">Nome</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Caixa principal"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Tipo</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'bank' | 'cash' }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="cash">Caixa</option>
            <option value="bank">Banco</option>
          </select>
        </div>
        {form.type === 'bank' && (
          <>
            <div className="min-w-[100px]">
              <label className="mb-1 block text-xs font-medium text-slate-500">Banco</label>
              <input value={form.bankCode ?? ''} onChange={(e) => setForm((f) => ({ ...f, bankCode: e.target.value }))} placeholder="Código" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
            </div>
            <div className="min-w-[100px]">
              <label className="mb-1 block text-xs font-medium text-slate-500">Agência</label>
              <input value={form.agency ?? ''} onChange={(e) => setForm((f) => ({ ...f, agency: e.target.value }))} placeholder="Agência" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
            </div>
            <div className="min-w-[120px]">
              <label className="mb-1 block text-xs font-medium text-slate-500">Conta</label>
              <input value={form.accountNumber ?? ''} onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))} placeholder="Conta" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
            </div>
          </>
        )}
        <button type="submit" disabled={createMut.isPending} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">
          Adicionar
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Agência/Conta</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {accounts.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  {editing?.id === a.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input value={editing.name} onChange={(e) => setEditing((x) => (x ? { ...x, name: e.target.value } : null))} className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                      </td>
                      <td className="px-4 py-3">
                        <select value={editing.type} onChange={(e) => setEditing((x) => (x ? { ...x, type: e.target.value as 'bank' | 'cash' } : null))} className="rounded border border-slate-300 px-2 py-1 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500">
                          <option value="cash">Caixa</option>
                          <option value="bank">Banco</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{editing.type === 'bank' ? `${editing.agency ?? ''} / ${editing.accountNumber ?? ''}` : '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => updateMut.mutate({ id: a.id, body: { name: editing.name, type: editing.type } })} disabled={updateMut.isPending} className="mr-2 rounded bg-teal-600 px-2 py-1 text-xs font-medium text-white hover:bg-teal-700 disabled:opacity-60">Salvar</button>
                        <button type="button" onClick={() => setEditing(null)} className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-slate-800">{a.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${a.type === 'bank' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'}`}>
                          {a.type === 'bank' ? 'Banco' : 'Caixa'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{a.type === 'bank' ? `${a.agency ?? ''} / ${a.accountNumber ?? ''}` : '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setEditing(a)} className="mr-2 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">Editar</button>
                        <button onClick={() => deleteMut.mutate(a.id)} disabled={deleteMut.isPending} className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-60">Excluir</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
