'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { BillingConfig, BillingPlanKey, Entitlements } from '@/lib/billing';
import { PayPalSubscribeButton } from '@/components/billing/PayPalSubscribeButton';

export function BillingSettingsPanel() {
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subRes, cfgRes] = await Promise.all([
        fetch('/api/billing/subscription'),
        fetch('/api/billing/config'),
      ]);
      const subData = await subRes.json();
      const cfgData = await cfgRes.json();
      if (!subRes.ok) throw new Error((subData as { error?: string }).error ?? 'Chargement impossible');
      if (!cfgRes.ok) throw new Error((cfgData as { error?: string }).error ?? 'Config indisponible');
      setEntitlements(subData as Entitlements);
      setConfig(cfgData as BillingConfig);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const clientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || config?.paypal_client_id || '';

  const renderPayPalFor = (planKey: BillingPlanKey) => {
    const plan = config?.plans.find((p) => p.key === planKey);
    if (!plan) return null;
    return (
      <div key={planKey} className="rounded-lg border p-4">
        <p className="mb-2 text-sm font-medium text-slate-900">
          {plan.label} — {plan.price_usd}$ / mois ({plan.sermons_per_month} prédications)
        </p>
        <PayPalSubscribeButton
          clientId={clientId}
          paypalPlanId={plan.paypal_plan_id}
          planKey={planKey}
        />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan actuel</CardTitle>
        <CardDescription>Gérez votre abonnement PayPal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && entitlements && (
          <>
            <div className="rounded-lg border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
              <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{entitlements.plan_label}</h3>
                  <p className="text-slate-600">
                    {entitlements.sermons_used} / {entitlements.sermons_limit} prédications ce mois-ci
                  </p>
                  {entitlements.external_subscription_id && (
                    <p className="mt-1 text-xs text-slate-500">
                      Abonnement PayPal : {entitlements.external_subscription_id}
                    </p>
                  )}
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-3xl font-bold text-indigo-600">
                    {entitlements.price_usd != null ? `${entitlements.price_usd}$` : '0$'}
                  </p>
                  <p className="text-sm text-slate-600">/ mois</p>
                </div>
              </div>
              {entitlements.plan === 'free' && (
                <p className="text-sm text-slate-600">
                  Passez à un plan payant pour augmenter votre quota mensuel.
                </p>
              )}
            </div>

            {entitlements.plan === 'free' && config && config.plans.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-medium">Choisir un abonnement</h3>
                  {renderPayPalFor('essentiel')}
                  {renderPayPalFor('avance')}
                </div>
              </>
            )}

            {entitlements.plan !== 'free' && (
              <p className="text-sm text-slate-600">
                Pour modifier ou annuler l’abonnement, utilisez votre compte{' '}
                <a
                  href="https://www.paypal.com/myaccount/autopay/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-indigo-600 hover:underline"
                >
                  PayPal
                </a>
                .
              </p>
            )}

            <Button variant="outline" asChild>
              <Link href="/pricing">Voir tous les plans</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
