'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Mic,
  LogOut,
  Home,
  List,
  BarChart3,
  Settings,
  CreditCard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/record', label: 'Enregistrer', icon: List },
  { href: '/analytics', label: 'Statistiques', icon: BarChart3 },
  { href: '/pricing', label: 'Abonnement', icon: CreditCard },
  { href: '/settings', label: 'Paramètres', icon: Settings },
] as const

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: typeof Home
  active: boolean
}) {
  return (
    <Button
      variant={active ? 'default' : 'ghost'}
      size="sm"
      className={cn(
        'shrink-0 gap-2',
        active && 'bg-indigo-600 text-white hover:bg-indigo-600/90',
      )}
      asChild
    >
      <Link href={href}>
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    </Button>
  )
}

export function KVoiceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 flex-col gap-3 py-2 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0">
            <div className="flex min-w-0 items-center gap-3">
              <div className="shrink-0 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 p-2">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold text-slate-900">K-Voice</h1>
                <p className="truncate text-xs text-slate-500">Église Évangélique de kisangani</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
              <div className="flex max-w-full items-center gap-1 overflow-x-auto pb-0 sm:max-w-[70vw]">
                {nav.map((item) => (
                  <NavLink
                    key={item.href}
                    {...item}
                    active={
                      item.href === '/'
                        ? pathname === '/'
                        : pathname === item.href || pathname.startsWith(item.href + '/')
                    }
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 gap-2"
                onClick={() => logout('/login')}
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
