export type BillingPlanKey = 'essentiel' | 'avance';

export interface BillingPlanPublic {
  key: BillingPlanKey;
  label: string;
  price_usd: number;
  sermons_per_month: number;
  paypal_plan_id: string;
}

export interface BillingConfig {
  paypal_client_id: string;
  paypal_mode: string;
  plans: BillingPlanPublic[];
}

export interface Entitlements {
  plan: string;
  plan_label: string;
  sermons_limit: number;
  sermons_used: number;
  can_create_sermon: boolean;
  subscription_status: string;
  payment_provider?: string | null;
  external_subscription_id?: string | null;
  price_usd?: number | null;
}

export const PLAN_MARKETING: Record<
  BillingPlanKey,
  { title: string; priceLabel: string; highlight?: boolean }
> = {
  essentiel: { title: 'Essentiel', priceLabel: '25$' },
  avance: { title: 'Avancé', priceLabel: '55$', highlight: true },
};
