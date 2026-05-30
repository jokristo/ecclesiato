'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import type { BillingConfig, BillingPlanKey } from '@/lib/billing';
import { PayPalSubscribeButton } from '@/components/billing/PayPalSubscribeButton';

interface PlanSubscribeActionProps {
  planKey: BillingPlanKey;
  variant?: 'light' | 'dark';
}

export function PlanSubscribeAction({ planKey, variant = 'light' }: PlanSubscribeActionProps) {
  const { data: session, status } = useSession();
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/billing/config')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Config indisponible');
        setConfig(data as BillingConfig);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur réseau'));
  }, []);

  const loginHref = `/login?callbackUrl=${encodeURIComponent('/pricing')}`;
  const plan = config?.plans.find((p) => p.key === planKey);

  if (status === 'loading' || (session && !config && !error)) {
    return (
      <div className="flex justify-center py-3">
        <Loader2
          className={`h-6 w-6 animate-spin ${variant === 'dark' ? 'text-slate-400' : 'text-blue-600'}`}
        />
      </div>
    );
  }

  if (!session) {
    return (
      <Link
        href={loginHref}
        className={
          variant === 'dark'
            ? 'block w-full rounded-xl bg-blue-600 py-3 px-4 text-center font-semibold text-white shadow-lg shadow-blue-900 transition-colors hover:bg-blue-500'
            : 'block w-full rounded-xl bg-blue-50 py-3 px-4 text-center font-semibold text-blue-700 transition-colors hover:bg-blue-100'
        }
      >
        Se connecter pour s&apos;abonner
      </Link>
    );
  }

  if (error || !plan) {
    return (
      <p className={`text-center text-sm ${variant === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
        {error ?? `Le plan « ${planKey} » n’est pas encore disponible via PayPal.`}
      </p>
    );
  }

  const clientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || config?.paypal_client_id || '';

  return (
    <PayPalSubscribeButton
      clientId={clientId}
      paypalPlanId={plan.paypal_plan_id}
      planKey={planKey}
    />
  );
}
