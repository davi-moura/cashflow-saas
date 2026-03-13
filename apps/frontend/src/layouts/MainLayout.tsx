import { Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/entries', label: 'Lançamentos' },
  { to: '/accounts', label: 'Contas' },
  { to: '/categories', label: 'Categorias' },
];

export function MainLayout() {
  const { user, tenant, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white shadow-sm">
        <div className="flex h-full flex-col p-4">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <span className="text-xl font-bold text-teal-600">CashFlow</span>
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map(({ to, label }) => {
              const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-slate-200 pt-4">
            <p className="truncate text-xs font-medium text-slate-500">{tenant?.name}</p>
            <p className="truncate text-sm text-slate-700">{user?.email}</p>
            <button
              type="button"
              onClick={logout}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
