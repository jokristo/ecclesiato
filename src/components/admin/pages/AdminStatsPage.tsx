'use client'


import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { mockOrganizations, platformUsage } from "@/lib/mockAdmin";
import { Mic, Zap, HardDrive, Users } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg p-3 text-xs shadow-xl" style={{ background: "#1e2130", border: "1px solid rgba(255,255,255,0.1)", color: "#e5e7eb" }}>
        <p className="font-semibold mb-1" style={{ color: "#a5b4fc" }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

const orgSermonData = mockOrganizations
  .filter(o => o.sermonsTotal > 0)
  .sort((a, b) => b.sermonsTotal - a.sermonsTotal)
  .map(o => ({
    name: o.name.length > 22 ? o.name.slice(0, 22) + "…" : o.name,
    total: o.sermonsTotal,
    mois: o.sermonsThisMonth,
  }));

const orgStorageData = mockOrganizations
  .filter(o => o.storageUsedMb > 0)
  .sort((a, b) => b.storageUsedMb - a.storageUsedMb)
  .map(o => ({
    name: o.name.length > 22 ? o.name.slice(0, 22) + "…" : o.name,
    used: parseFloat((o.storageUsedMb / 1024).toFixed(1)),
    quota: parseFloat((o.storageQuotaMb / 1024).toFixed(0)),
  }));

export function AdminStatsPage() {
  const topSermons = mockOrganizations.reduce((s, o) => s + o.sermonsTotal, 0);
  const topTranscriptions = mockOrganizations.reduce((s, o) => s + o.transcriptionsTotal, 0);
  const totalStorage = mockOrganizations.reduce((s, o) => s + o.storageUsedMb, 0);
  const totalAiCalls = mockOrganizations.reduce((s, o) => s + o.aiCreditsUsed, 0);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Statistiques d'utilisation</h1>
        <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>Analyse détaillée par organisation</p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-4 gap-5">
        {[
          { label: "Prédications cumulées", value: topSermons, icon: Mic, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
          { label: "Transcriptions réalisées", value: topTranscriptions, icon: Zap, color: "#818cf8", bg: "rgba(129,140,248,0.1)" },
          { label: "Stockage total (GB)", value: `${(totalStorage / 1024).toFixed(1)} GB`, icon: HardDrive, color: "#38bdf8", bg: "rgba(56,189,248,0.1)" },
          { label: "Crédits IA consommés", value: totalAiCalls.toLocaleString(), icon: Users, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-5" style={{ background: "#13151e", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="p-2 w-fit rounded-lg mb-3" style={{ background: s.bg }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "#6b7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Platform trends */}
      <div className="rounded-xl p-6" style={{ background: "#13151e", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-white">Tendances plateforme — 7 derniers mois</h2>
          <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>Prédications, transcriptions et appels IA</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={platformUsage}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
            <Line type="monotone" dataKey="sermons" name="Prédications" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="transcriptions" name="Transcriptions" stroke="#818cf8" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Per-org charts */}
      <div className="grid grid-cols-2 gap-5">
        {/* Sermons per org */}
        <div className="rounded-xl p-6" style={{ background: "#13151e", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-white">Prédications par organisation</h2>
            <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>Total cumulé vs mois en cours</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={orgSermonData} layout="vertical" barSize={8} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} width={130} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" name="Total" fill="#f59e0b" radius={[0, 3, 3, 0]} />
              <Bar dataKey="mois" name="Ce mois" fill="#818cf8" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Storage per org */}
        <div className="rounded-xl p-6" style={{ background: "#13151e", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-white">Stockage par organisation (GB)</h2>
            <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>Espace utilisé vs quota alloué</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={orgStorageData} layout="vertical" barSize={8} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} unit=" GB" />
              <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} width={130} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="quota" name="Quota" fill="rgba(255,255,255,0.06)" radius={[0, 3, 3, 0]} />
              <Bar dataKey="used" name="Utilisé" fill="#38bdf8" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed per-org table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-5 py-4" style={{ background: "#13151e", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-sm font-semibold text-white">Détails par organisation</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background: "#0f1117", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              {["Organisation", "Sermons / mois", "Transcriptions / mois", "Stockage", "Crédits IA", "Utilisateurs"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#4b5563" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockOrganizations.sort((a, b) => b.sermonsTotal - a.sermonsTotal).map((org, i) => {
              const storagePct = Math.round((org.storageUsedMb / org.storageQuotaMb) * 100);
              const creditPct = Math.round((org.aiCreditsUsed / org.aiCreditsQuota) * 100);
              return (
                <tr key={org.id} style={{ background: i % 2 === 0 ? "#13151e" : "#0f1117", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "rgba(129,140,248,0.12)", color: "#818cf8" }}>
                        {org.name[0]}
                      </div>
                      <span className="text-sm font-medium text-white">{org.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-white">{org.sermonsTotal}</span>
                    <span className="text-xs ml-1.5" style={{ color: "#4b5563" }}>/ +{org.sermonsThisMonth}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-white">{org.transcriptionsTotal}</span>
                    <span className="text-xs ml-1.5" style={{ color: "#4b5563" }}>/ +{org.transcriptionsThisMonth}</span>
                  </td>
                  <td className="px-4 py-3 w-32">
                    <div className="space-y-1">
                      <span className="text-xs" style={{ color: storagePct > 85 ? "#f43f5e" : "#9ca3af" }}>{storagePct}%</span>
                      <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${Math.min(storagePct, 100)}%`, background: storagePct > 85 ? "#f43f5e" : "#38bdf8" }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 w-32">
                    <div className="space-y-1">
                      <span className="text-xs" style={{ color: creditPct > 85 ? "#f43f5e" : "#9ca3af" }}>{creditPct}%</span>
                      <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${Math.min(creditPct, 100)}%`, background: creditPct > 85 ? "#f43f5e" : "#f59e0b" }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-white">{org.memberCount}</span>
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
