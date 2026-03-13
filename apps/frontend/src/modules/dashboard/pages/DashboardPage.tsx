import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '../../../api/dashboard';

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchDashboard(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600" />
        Carregando...
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        Erro ao carregar dashboard.
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">Saldo total</h2>
        <p className="mt-2 text-3xl font-bold text-teal-600">
          R$ {typeof data.totalBalance === 'number' ? data.totalBalance.toFixed(2) : Number(data.totalBalance).toFixed(2)}
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500">Saldo por conta</h2>
        <ul className="space-y-3">
          {data.balances.map((b) => (
            <li
              key={b.accountId}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3"
            >
              <span className="font-medium text-slate-700">{b.accountName}</span>
              <span className="text-slate-600">
                {b.type === 'bank' ? 'Banco' : 'Caixa'}: R$ {typeof b.balance === 'number' ? b.balance.toFixed(2) : Number(b.balance).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500">
          Período ({data.period.startDate} a {data.period.endDate})
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">Entradas</p>
            <p className="text-xl font-semibold text-emerald-800">
              R$ {typeof data.entriesInPeriod === 'number' ? data.entriesInPeriod.toFixed(2) : Number(data.entriesInPeriod).toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-700">Saídas</p>
            <p className="text-xl font-semibold text-red-800">
              R$ {typeof data.exitsInPeriod === 'number' ? data.exitsInPeriod.toFixed(2) : Number(data.exitsInPeriod).toFixed(2)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
