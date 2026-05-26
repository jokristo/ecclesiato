'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (!isSuperAdmin) {
      router.replace('/');
    }
  }, [isSuperAdmin, isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: '#0f1117' }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  return <>{children}</>;
}
