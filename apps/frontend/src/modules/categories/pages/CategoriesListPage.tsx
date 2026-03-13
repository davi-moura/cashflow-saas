import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCategories, createCategory, updateCategory, deleteCategory, type Category } from '../../../api/categories';

export function CategoriesListPage() {
  const [form, setForm] = useState<Partial<Category> & { name: string }>({ name: '', type: 'expense' });
  const [editing, setEditing] = useState<Category | null>(null);
  const client = useQueryClient();
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
  const createMut = useMutation({
    mutationFn: (body: { name: string; type: 'income' | 'expense' }) => createCategory(body),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['categories'] }); setForm({ name: '', type: 'expense' }); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Category> }) => updateCategory(id, body),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['categories'] }); setEditing(null); },
  });
  const deleteMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => client.invalidateQueries({ queryKey: ['categories'] }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name?.trim()) createMut.mutate({ name: form.name.trim(), type: form.type ?? 'expense' });
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
      <h1 className="text-2xl font-bold text-slate-800">Categorias</h1>

      <form
        onSubmit={handleCreate}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="min-w-[200px]">
          <label className="mb-1 block text-xs font-medium text-slate-500">Nome</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Alimentação"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Tipo</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'income' | 'expense' }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </div>
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
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  {editing?.id === c.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          value={editing.name}
                          onChange={(e) => setEditing((x) => (x ? { ...x, name: e.target.value } : null))}
                          className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editing.type}
                          onChange={(e) => setEditing((x) => (x ? { ...x, type: e.target.value as 'income' | 'expense' } : null))}
                          className="rounded border border-slate-300 px-2 py-1 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        >
                          <option value="expense">Despesa</option>
                          <option value="income">Receita</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => updateMut.mutate({ id: c.id, body: { name: editing.name, type: editing.type } })} disabled={updateMut.isPending} className="mr-2 rounded bg-teal-600 px-2 py-1 text-xs font-medium text-white hover:bg-teal-700 disabled:opacity-60">Salvar</button>
                        <button type="button" onClick={() => setEditing(null)} className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${c.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {c.type === 'income' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setEditing(c)} className="mr-2 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">Editar</button>
                        <button onClick={() => deleteMut.mutate(c.id)} disabled={deleteMut.isPending} className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-60">Excluir</button>
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
