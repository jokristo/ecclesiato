'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/', label: 'Accueil' },
  { href: '/pricing', label: 'Tarifs' },
] as const;

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();
  const isLoggedIn = status === 'authenticated';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-600 p-2">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">K-Voice</span>
          </Link>

          <nav className="hidden items-center gap-8 sm:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Mon espace
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Connexion
                </Link>
                <Link
                  href="/login?callbackUrl=/record"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Commencer
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2 text-slate-600">
              <Mic className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-slate-900">K-Voice</span>
              <span className="text-sm">— L&apos;IA au service de votre message pastoral</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-600">
              <Link href="/pricing" className="hover:text-slate-900">
                Tarifs
              </Link>
              <Link href="/login" className="hover:text-slate-900">
                Connexion
              </Link>
              <a
                href="mailto:contact@kvoice.com"
                className="hover:text-slate-900"
              >
                Contact
              </a>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} K-Voice. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
