'use client';

import { useCallback, useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { BillingPlanKey } from '@/lib/billing';

interface PayPalSubscribeButtonProps {
  clientId: string;
  paypalPlanId: string;
  planKey: BillingPlanKey;
  className?: string;
}

export function PayPalSubscribeButton({
  clientId,
  paypalPlanId,
  planKey,
  className,
}: PayPalSubscribeButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activating, setActivating] = useState(false);

  const onApprove = useCallback(
    async (data: { subscriptionID?: string }) => {
      const subscriptionId = data.subscriptionID;
      if (!subscriptionId) {
        toast({
          title: 'Erreur PayPal',
          description: 'Identifiant d’abonnement manquant.',
          variant: 'destructive',
        });
        return;
      }
      setActivating(true);
      try {
        const res = await fetch('/api/billing/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription_id: subscriptionId, plan: planKey }),
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error((payload as { error?: string }).error ?? 'Activation impossible');
        }
        toast({
          title: 'Abonnement activé',
          description: `Votre plan ${(payload as { plan_label?: string }).plan_label ?? planKey} est actif.`,
        });
        router.push('/settings?tab=billing');
        router.refresh();
      } catch (e) {
        toast({
          title: 'Activation échouée',
          description: e instanceof Error ? e.message : 'Réessayez ou contactez le support.',
          variant: 'destructive',
        });
      } finally {
        setActivating(false);
      }
    },
    [planKey, router, toast],
  );

  if (!clientId || !paypalPlanId) {
    return (
      <p className="text-center text-sm text-slate-500">
        Paiement PayPal non configuré (contactez l’administrateur).
      </p>
    );
  }

  return (
    <div className={className}>
      {activating && (
        <div className="mb-2 flex items-center justify-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Activation de l’abonnement…
        </div>
      )}
      <PayPalScriptProvider
        options={{
          clientId,
          vault: true,
          intent: 'subscription',
          currency: 'USD',
        }}
      >
        <PayPalButtons
          style={{ shape: 'rect', color: 'gold', layout: 'vertical', label: 'paypal' }}
          disabled={activating}
          createSubscription={(_data, actions) =>
            actions.subscription.create({ plan_id: paypalPlanId })
          }
          onApprove={onApprove}
          onError={() => {
            toast({
              title: 'Erreur PayPal',
              description: 'Le paiement n’a pas pu être finalisé.',
              variant: 'destructive',
            });
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}
