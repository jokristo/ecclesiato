'use client'


import { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  ExternalLink,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { mockOrganizations, monthlyRevenue } from "@/lib/mockAdmin";

const planDetails = {
  free: { price: 0, color: "#6b7280", label: "Free" },
  starter: { price: 19, color: "#10b981", label: "Starter" },
  pro: { price: 49, color: "#38bdf8", label: "Pro" },
  enterprise: { price: 149, color: "#818cf8", label: "Enterprise" },
};

const payingOrgs = mockOrganizations.filter(o => o.monthlyRevenue > 0).sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);
const totalMRR = payingOrgs.reduce((s, o) => s + o.monthlyRevenue, 0);
const overdueOrgs = mockOrganizations.filter(o => o.paymentStatus === "overdue");

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg p-3 text-xs shadow-xl" style={{ background: "#1e2130", border: "1px solid rgba(255,255,255,0.1)", color: "#e5e7eb" }}>
        <p className="font-semibold mb-1" style={{ color: "#a5b4fc" }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value} €</span></p>
        ))}
      </div>
    );
  }
  return null;
};

export function AdminSubscriptionsPage() {
  const [tab, setTab] = useState<"active" | "overdue">("active");

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Abonnements</h1>
        <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>Gestion des revenus et des paiements</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-5">
        {[
          { label: "MRR (Revenu mensuel)", value: `${totalMRR} €`, icon: DollarSign, color: "#10b981", bg: "rgba(16,185,129,0.1)", sub: "Revenu récurrent actuel" },
          { label: "ARR (Annualisé)", value: `${(totalMRR * 12).toLocaleString()} €`, icon: TrendingUp, color: "#818cf8", bg: "rgba(129,140,248,0.1)", sub: "Projection annuelle" },
          { label: "Comptes payants", value: payingOrgs.length, icon: CreditCard, color: "#38bdf8", bg: "rgba(56,189,248,0.1)", sub: `Sur ${mockOrganizations.length} organisations` },
          { label: "Paiements en retard", value: overdueOrgs.length, icon: AlertCircle, color: overdueOrgs.length > 0 ? "#f43f5e" : "#10b981", bg: overdueOrgs.length > 0 ? "rgba(244,63,94,0.1)" : "rgba(16,185,129,0.1)", sub: overdueOrgs.length > 0 ? "Action requise" : "Tout est à jour" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-5" style={{ background: "#13151e", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg" style={{ background: s.bg }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <span className="text-xs" style={{ color: "#6b7280" }}>{s.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "#4b5563" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="rounded-xl p-6" style={{ background: "#13151e", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Évolution du MRR</h2>
            <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>7 derniers mois</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
            <TrendingUp className="w-3 h-3" />
            +39.3% en 7 mois
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthlyRevenue}>
            <defs>
              <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} unit="€" />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" name="Revenu" stroke="#10b981" strokeWidth={2} fill="url(#mrrGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Plans summary */}
      <div className="grid grid-cols-4 gap-4">
        {(["enterprise", "pro", "starter", "free"] as const).map(plan => {
          const orgsOnPlan = mockOrganizations.filter(o => o.plan === plan);
          const planRev = orgsOnPlan.reduce((s, o) => s + o.monthlyRevenue, 0);
          const pd = planDetails[plan];
          return (
            <div key={plan} className="rounded-xl p-5" style={{ background: "#13151e", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: `${pd.color}18`, color: pd.color }}>
                  {pd.label}
                </span>
                <span className="text-xs" style={{ color: "#4b5563" }}>{pd.price > 0 ? `${pd.price} €/mois` : "Gratuit"}</span>
              </div>
              <div className="text-2xl font-bold text-white">{orgsOnPlan.length}</div>
              <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>organisation{orgsOnPlan.length > 1 ? "s" : ""}</div>
              {planRev > 0 && (
                <div className="mt-2 text-xs font-medium" style={{ color: "#10b981" }}>+{planRev} €/mois</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Subscriptions list */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Tabs */}
        <div className="flex" style={{ background: "#13151e", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {[
            { key: "active", label: `Abonnements actifs (${payingOrgs.filter(o => o.paymentStatus === "current").length})` },
            { key: "overdue", label: `Retards de paiement (${overdueOrgs.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className="px-5 py-3 text-sm font-medium transition-colors"
              style={tab === t.key
                ? { color: "#818cf8", borderBottom: "2px solid #818cf8" }
                : { color: "#6b7280", borderBottom: "2px solid transparent" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <table className="w-full">
          <thead>
            <tr style={{ background: "#0f1117", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              {["Organisation", "Plan", "Montant", "Statut paiement", "Prochaine échéance", "Crédit IA utilisé", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#4b5563" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(tab === "active" ? payingOrgs.filter(o => o.paymentStatus === "current") : overdueOrgs).map((org, i) => {
              const pd = planDetails[org.plan];
              const creditPct = Math.round((org.aiCreditsUsed / org.aiCreditsQuota) * 100);
              return (
                <tr key={org.id} className="transition-colors" style={{ background: i % 2 === 0 ? "#13151e" : "#0f1117", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: `${pd.color}18`, color: pd.color }}>
                        {org.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{org.name}</p>
                        <p className="text-xs" style={{ color: "#6b7280" }}>{org.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: `${pd.color}18`, color: pd.color }}>
                      {pd.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold" style={{ color: "#10b981" }}>{org.monthlyRevenue} €</span>
                    <span className="text-xs ml-1" style={{ color: "#4b5563" }}>/mois</span>
                  </td>
                  <td className="px-4 py-3">
                    {org.paymentStatus === "current" ? (
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#10b981" }}>
                        <CheckCircle2 className="w-3.5 h-3.5" />À jour
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#f43f5e" }}>
                        <AlertCircle className="w-3.5 h-3.5" />En retard
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "#9ca3af" }}>
                      <Calendar className="w-3.5 h-3.5" style={{ color: "#4b5563" }} />
                      {org.nextBillingDate ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 w-36">
                    <div className="space-y-1">
                      <span className="text-xs" style={{ color: creditPct > 85 ? "#f43f5e" : "#9ca3af" }}>{creditPct}%</span>
                      <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-1 rounded-full" style={{ width: `${Math.min(creditPct, 100)}%`, background: creditPct > 85 ? "#f43f5e" : "#818cf8" }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg transition-all" style={{ color: "#4b5563" }}>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
