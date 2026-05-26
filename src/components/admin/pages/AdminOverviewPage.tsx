'use client'


import {
  Building2,
  TrendingUp,
  Users,
  Mic,
  DollarSign,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { mockOrganizations, monthlyRevenue, platformUsage } from "@/lib/mockAdmin";

const totalRevenue = mockOrganizations.reduce((s, o) => s + o.monthlyRevenue, 0);
const activeOrgs = mockOrganizations.filter(o => o.status === "active").length;
const totalSermons = mockOrganizations.reduce((s, o) => s + o.sermonsTotal, 0);
const totalMembers = mockOrganizations.reduce((s, o) => s + o.memberCount, 0);

const statCards = [
  {
    label: "Revenu mensuel",
    value: `${totalRevenue} €`,
    sub: "+8.4% vs mois dernier",
    icon: DollarSign,
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.2)",
    up: true,
  },
  {
    label: "Organisations actives",
    value: activeOrgs,
    sub: `${mockOrganizations.length} au total`,
    icon: Building2,
    color: "#818cf8",
    bg: "rgba(129,140,248,0.1)",
    border: "rgba(129,140,248,0.2)",
    up: null,
  },
  {
    label: "Prédications totales",
    value: totalSermons,
    sub: "+293 ce mois",
    icon: Mic,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.2)",
    up: true,
  },
  {
    label: "Utilisateurs totaux",
    value: totalMembers,
    sub: "Sur toutes les orgs",
    icon: Users,
    color: "#38bdf8",
    bg: "rgba(56,189,248,0.1)",
    border: "rgba(56,189,248,0.2)",
    up: null,
  },
];

const recentActivity = [
  { org: "Église Bethel Abidjan", action: "41 nouvelles prédications ce mois", time: "Il y a 2h", type: "sermon" },
  { org: "Assemblée de Grâce Kinshasa", action: "Facture juin 2026 générée (149€)", time: "Il y a 5h", type: "billing" },
  { org: "Mission Évangélique Lyon", action: "Nouveau compte créé – en attente de validation", time: "Hier 14h32", type: "signup" },
  { org: "Tabernacle de la Victoire", action: "Compte suspendu – paiement en retard", time: "22 avr. 2026", type: "suspend" },
  { org: "Église Nouvelle Alliance Dakar", action: "Plan Starter activé", time: "1 mar. 2026", type: "upgrade" },
];

const activityIcon: Record<string, { icon: React.ReactNode; color: string }> = {
  sermon: { icon: <Mic className="w-3.5 h-3.5" />, color: "#f59e0b" },
  billing: { icon: <DollarSign className="w-3.5 h-3.5" />, color: "#10b981" },
  signup: { icon: <Building2 className="w-3.5 h-3.5" />, color: "#818cf8" },
  suspend: { icon: <XCircle className="w-3.5 h-3.5" />, color: "#f43f5e" },
  upgrade: { icon: <ArrowUpRight className="w-3.5 h-3.5" />, color: "#38bdf8" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg p-3 text-xs shadow-xl" style={{ background: "#1e2130", border: "1px solid rgba(255,255,255,0.1)", color: "#e5e7eb" }}>
        <p className="font-semibold mb-1" style={{ color: "#a5b4fc" }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}{p.name === "Revenu" ? " €" : ""}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

export function AdminOverviewPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Vue d'ensemble</h1>
        <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>Tableau de bord global de la plateforme K-Voice</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-5">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl p-5" style={{ background: "#13151e", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              {s.up !== null && (
                <span className="flex items-center gap-0.5 text-xs font-medium" style={{ color: "#10b981" }}>
                  <TrendingUp className="w-3 h-3" />
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
            <div className="text-xs" style={{ color: "#6b7280" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-5 gap-5">
        {/* Revenue chart */}
        <div className="col-span-3 rounded-xl p-6" style={{ background: "#13151e", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-white">Revenu mensuel récurrent</h2>
              <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>7 derniers mois</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
              +8.4% MoM
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} unit="€" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenu" stroke="#818cf8" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity feed */}
        <div className="col-span-2 rounded-xl p-6" style={{ background: "#13151e", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4" style={{ color: "#818cf8" }} />
            <h2 className="text-sm font-semibold text-white">Activité récente</h2>
          </div>
          <div className="space-y-4">
            {recentActivity.map((a, i) => {
              const meta = activityIcon[a.type];
              return (
                <div key={i} className="flex gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30`, color: meta.color }}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "#e5e7eb" }}>{a.org}</p>
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: "#6b7280" }}>{a.action}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#4b5563" }}>{a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Usage chart */}
      <div className="rounded-xl p-6" style={{ background: "#13151e", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-white">Utilisation de la plateforme</h2>
          <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>Prédications et transcriptions sur 7 mois</p>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={platformUsage} barSize={12} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
            <Bar dataKey="sermons" name="Prédications" fill="#818cf8" radius={[3, 3, 0, 0]} />
            <Bar dataKey="transcriptions" name="Transcriptions" fill="#10b981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Plan distribution */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { plan: "Enterprise", count: mockOrganizations.filter(o => o.plan === "enterprise").length, color: "#818cf8", icon: "✦" },
          { plan: "Pro", count: mockOrganizations.filter(o => o.plan === "pro").length, color: "#38bdf8", icon: "◈" },
          { plan: "Starter", count: mockOrganizations.filter(o => o.plan === "starter").length, color: "#10b981", icon: "◆" },
          { plan: "Free", count: mockOrganizations.filter(o => o.plan === "free").length, color: "#6b7280", icon: "○" },
        ].map(p => (
          <div key={p.plan} className="rounded-xl px-5 py-4 flex items-center gap-4" style={{ background: "#13151e", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-2xl" style={{ color: p.color }}>{p.icon}</span>
            <div>
              <div className="text-xl font-bold text-white">{p.count}</div>
              <div className="text-xs" style={{ color: "#6b7280" }}>Plan {p.plan}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
