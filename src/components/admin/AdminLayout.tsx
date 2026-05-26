'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Mic,
  LogOut,
  LayoutDashboard,
  Building2,
  CreditCard,
  BarChart3,
  Server,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { path: '/admin', label: 'Vue d\'ensemble', icon: LayoutDashboard, exact: true },
  { path: '/admin/organisations', label: 'Organisations', icon: Building2 },
  { path: '/admin/abonnements', label: 'Abonnements', icon: CreditCard },
  { path: '/admin/statistiques', label: 'Statistiques', icon: BarChart3 },
  { path: '/admin/systeme', label: 'Système', icon: Server },
] as const;

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#0f1117' }}>
      <aside
        className="flex w-64 flex-shrink-0 flex-col"
        style={{ background: '#13151e', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="flex items-center gap-3 px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 p-2">
            <Mic className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-white">K-Voice</p>
            <p className="text-xs leading-tight" style={{ color: '#6b7280' }}>
              Administration
            </p>
          </div>
        </div>

        <div
          className="mx-4 mb-2 mt-4 flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
        >
          <ShieldCheck className="h-4 w-4" style={{ color: '#818cf8' }} />
          <span className="text-xs font-semibold" style={{ color: '#a5b4fc' }}>
            Super Administrateur
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  active ? 'text-white' : 'hover:text-white',
                )}
                style={
                  active
                    ? { background: 'rgba(99,102,241,0.18)', color: '#e0e7ff' }
                    : { color: '#6b7280' }
                }
              >
                <item.icon
                  className={cn('h-4 w-4 flex-shrink-0', active ? 'text-indigo-400' : 'text-current')}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 text-indigo-400 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link
            href="/"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:text-slate-300"
            style={{ color: '#6b7280' }}
          >
            <Mic className="h-4 w-4" />
            <span>Retour à l&apos;app</span>
          </Link>
          <button
            type="button"
            onClick={() => logout('/login')}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:text-slate-300"
            style={{ color: '#6b7280' }}
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-auto" style={{ background: '#0f1117' }}>
        {children}
      </div>
    </div>
  );
}
