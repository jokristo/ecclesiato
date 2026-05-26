'use client'


import { useState } from "react";
import {
  Search,
  Filter,
  Building2,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Ban,
  PlayCircle,
  ChevronRight,
  X,
  MapPin,
  Mail,
  Users,
  Mic,
  HardDrive,
  Zap,
  Calendar,
} from "lucide-react";
import { mockOrganizations, Organization, OrgStatus } from "@/lib/mockAdmin";

const planColors: Record<string, { bg: string; color: string; label: string }> = {
  free: { bg: "rgba(107,114,128,0.15)", color: "#9ca3af", label: "Free" },
  starter: { bg: "rgba(16,185,129,0.12)", color: "#10b981", label: "Starter" },
  pro: { bg: "rgba(56,189,248,0.12)", color: "#38bdf8", label: "Pro" },
  enterprise: { bg: "rgba(129,140,248,0.12)", color: "#818cf8", label: "Enterprise" },
};

const statusConfig: Record<OrgStatus, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  active: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "Actif", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  suspended: { icon: <XCircle className="w-3.5 h-3.5" />, label: "Suspendu", color: "#f43f5e", bg: "rgba(244,63,94,0.12)" },
  pending: { icon: <Clock className="w-3.5 h-3.5" />, label: "En attente", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
};

function StorageBar({ used, quota }: { used: number; quota: number }) {
  const pct = Math.min((used / quota) * 100, 100);
  const color = pct > 85 ? "#f43f5e" : pct > 60 ? "#f59e0b" : "#10b981";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs" style={{ color: "#6b7280" }}>
        <span>{(used / 1024).toFixed(1)} GB</span>
        <span>{(quota / 1024).toFixed(0)} GB</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function OrgDetailPanel({ org, onClose, onToggle }: { org: Organization; onClose: () => void; onToggle: (id: string) => void }) {
  const status = statusConfig[org.status];
  const plan = planColors[org.plan];
  const storagePercent = Math.round((org.storageUsedMb / org.storageQuotaMb) * 100);
  const creditsPercent = Math.round((org.aiCreditsUsed / org.aiCreditsQuota) * 100);

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="ml-auto h-full w-[480px] overflow-y-auto flex flex-col" style={{ background: "#13151e", borderLeft: "1px solid rgba(255,255,255,0.08)" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 flex items-start justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg" style={{ background: "rgba(129,140,248,0.15)", color: "#818cf8" }}>
              {org.name[0]}
            </div>
            <div>
              <h2 className="font-semibold text-white text-sm leading-tight">{org.name}</h2>
              <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{org.pastor}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: "#6b7280" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: status.bg, color: status.color }}>
              {status.icon}{status.label}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: plan.bg, color: plan.color }}>
              {plan.label}
            </span>
            {org.paymentStatus === "overdue" && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "rgba(244,63,94,0.12)", color: "#f43f5e" }}>
                Paiement en retard
              </span>
            )}
          </div>

          {/* Info grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#4b5563" }}>Informations</h3>
            {[
              { icon: Mail, label: org.email },
              { icon: MapPin, label: `${org.city}, ${org.country}` },
              { icon: Calendar, label: `Inscrit le ${org.createdAt}` },
              { icon: Users, label: `${org.memberCount} utilisateur${org.memberCount > 1 ? "s" : ""}` },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm" style={{ color: "#9ca3af" }}>
                <row.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#4b5563" }} />
                {row.label}
              </div>
            ))}
          </div>

          {/* Usage stats */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#4b5563" }}>Utilisation</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Prédications", value: org.sermonsTotal, sub: `+${org.sermonsThisMonth} ce mois`, icon: Mic, color: "#f59e0b" },
                { label: "Transcriptions", value: org.transcriptionsTotal, sub: `+${org.transcriptionsThisMonth} ce mois`, icon: Zap, color: "#818cf8" },
              ].map(s => (
                <div key={s.label} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                    <span className="text-xs" style={{ color: "#6b7280" }}>{s.label}</span>
                  </div>
                  <div className="text-xl font-bold text-white">{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#4b5563" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Storage */}
            <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <HardDrive className="w-3.5 h-3.5" style={{ color: "#38bdf8" }} />
                <span className="text-xs" style={{ color: "#6b7280" }}>Stockage — {storagePercent}%</span>
              </div>
              <StorageBar used={org.storageUsedMb} quota={org.storageQuotaMb} />
            </div>

            {/* AI Credits */}
            <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
                <span className="text-xs" style={{ color: "#6b7280" }}>Crédits IA — {creditsPercent}%</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs" style={{ color: "#6b7280" }}>
                  <span>{org.aiCreditsUsed.toLocaleString()}</span>
                  <span>{org.aiCreditsQuota.toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${Math.min(creditsPercent, 100)}%`, background: creditsPercent > 85 ? "#f43f5e" : "#f59e0b" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Billing */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#4b5563" }}>Facturation</h3>
            <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "#9ca3af" }}>Revenu mensuel</span>
                <span className="text-lg font-bold text-white">{org.monthlyRevenue > 0 ? `${org.monthlyRevenue} €` : "—"}</span>
              </div>
              {org.nextBillingDate && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs" style={{ color: "#6b7280" }}>Prochaine échéance</span>
                  <span className="text-xs" style={{ color: "#9ca3af" }}>{org.nextBillingDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#4b5563" }}>Actions</h3>
            {org.status === "active" ? (
              <button
                onClick={() => onToggle(org.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: "rgba(244,63,94,0.12)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.2)" }}
              >
                <Ban className="w-4 h-4" />
                Suspendre l'organisation
              </button>
            ) : (
              <button
                onClick={() => onToggle(org.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
              >
                <PlayCircle className="w-4 h-4" />
                Réactiver l'organisation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminOrgsPage() {
  const [orgs, setOrgs] = useState(mockOrganizations);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Organization | null>(null);

  const filtered = orgs.filter(o => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) || o.pastor.toLowerCase().includes(search.toLowerCase()) || o.city.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === "all" || o.plan === filterPlan;
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const toggleStatus = (id: string) => {
    setOrgs(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next: OrgStatus = o.status === "active" ? "suspended" : "active";
      return { ...o, status: next };
    }));
    setSelected(prev => {
      if (!prev || prev.id !== id) return prev;
      const next: OrgStatus = prev.status === "active" ? "suspended" : "active";
      return { ...prev, status: next };
    });
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Organisations</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>{orgs.length} organisations enregistrées</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4b5563" }} />
          <input
            type="text"
            placeholder="Rechercher une organisation..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none"
            style={{ background: "#1e2130", border: "1px solid rgba(255,255,255,0.08)", color: "#e5e7eb" }}
          />
        </div>

        <select
          value={filterPlan}
          onChange={e => setFilterPlan(e.target.value)}
          className="text-sm px-3 py-2 rounded-lg outline-none cursor-pointer"
          style={{ background: "#1e2130", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}
        >
          <option value="all">Tous les plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm px-3 py-2 rounded-lg outline-none cursor-pointer"
          style={{ background: "#1e2130", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="suspended">Suspendu</option>
          <option value="pending">En attente</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: "#13151e", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Organisation", "Statut", "Plan", "Prédications", "Stockage", "Revenu/mois", "Activité", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#4b5563" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((org, i) => {
              const status = statusConfig[org.status];
              const plan = planColors[org.plan];
              const storagePct = Math.round((org.storageUsedMb / org.storageQuotaMb) * 100);
              return (
                <tr
                  key={org.id}
                  className="transition-colors cursor-pointer"
                  style={{ background: i % 2 === 0 ? "#13151e" : "#0f1117", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(129,140,248,0.06)")}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "#13151e" : "#0f1117")}
                  onClick={() => setSelected(org)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "rgba(129,140,248,0.12)", color: "#818cf8" }}>
                        {org.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white leading-tight">{org.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{org.city}, {org.country}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs font-medium w-fit px-2 py-1 rounded-full" style={{ background: status.bg, color: status.color }}>
                      {status.icon}{status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: plan.bg, color: plan.color }}>
                      {plan.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-white">{org.sermonsTotal}</span>
                    <span className="text-xs ml-1.5" style={{ color: "#4b5563" }}>+{org.sermonsThisMonth}/mois</span>
                  </td>
                  <td className="px-4 py-3 w-28">
                    <div className="space-y-1">
                      <span className="text-xs" style={{ color: "#9ca3af" }}>{storagePct}%</span>
                      <div className="h-1.5 rounded-full w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${storagePct}%`, background: storagePct > 85 ? "#f43f5e" : storagePct > 60 ? "#f59e0b" : "#10b981" }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold" style={{ color: org.monthlyRevenue > 0 ? "#10b981" : "#4b5563" }}>
                      {org.monthlyRevenue > 0 ? `${org.monthlyRevenue} €` : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: "#6b7280" }}>{org.lastActivity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => toggleStatus(org.id)}
                        className="p-1.5 rounded-lg text-xs transition-all"
                        style={org.status === "active"
                          ? { background: "rgba(244,63,94,0.1)", color: "#f43f5e" }
                          : { background: "rgba(16,185,129,0.1)", color: "#10b981" }
                        }
                        title={org.status === "active" ? "Suspendre" : "Réactiver"}
                      >
                        {org.status === "active" ? <Ban className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setSelected(org)}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ background: "rgba(129,140,248,0.1)", color: "#818cf8" }}
                        title="Voir détails"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center" style={{ color: "#4b5563" }}>
            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune organisation trouvée</p>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <OrgDetailPanel
          org={selected}
          onClose={() => setSelected(null)}
          onToggle={id => { toggleStatus(id); }}
        />
      )}
    </div>
  );
}
