'use client'


import {
  CheckCircle2,
  AlertTriangle,
  Server,
  Cpu,
  Database,
  CloudUpload,
  Zap,
  Clock,
  RefreshCw,
  Activity,
} from "lucide-react";

const services = [
  { name: "API principale", status: "operational", latency: "42ms", uptime: "99.98%", icon: Server },
  { name: "File de transcription", status: "operational", latency: "—", uptime: "99.91%", icon: Clock },
  { name: "Moteur IA (résumés)", status: "operational", latency: "1.2s", uptime: "99.87%", icon: Zap },
  { name: "Stockage fichiers audio", status: "operational", latency: "88ms", uptime: "100%", icon: CloudUpload },
  { name: "Base de données", status: "degraded", latency: "210ms", uptime: "99.72%", icon: Database },
  { name: "Service d'authentification", status: "operational", latency: "35ms", uptime: "99.99%", icon: Cpu },
];

const recentEvents = [
  { time: "22 mai 2026 – 09:14", message: "Pic de charge détecté sur la BDD — réponse lente (>200ms)", level: "warn" },
  { time: "21 mai 2026 – 23:51", message: "Déploiement v2.4.1 réussi — 0 downtime", level: "info" },
  { time: "20 mai 2026 – 16:03", message: "Alerte quota IA : Église Bethel Abidjan à 78% de consommation", level: "warn" },
  { time: "18 mai 2026 – 08:30", message: "Nouveau compte en attente de validation : Mission Évangélique Lyon", level: "info" },
  { time: "15 mai 2026 – 14:22", message: "Compte suspendu automatiquement : Tabernacle de la Victoire (impayé)", level: "error" },
  { time: "10 mai 2026 – 11:00", message: "Backup base de données réussi (52.3 GB)", level: "info" },
];

const levelStyle: Record<string, { color: string; bg: string; dot: string }> = {
  info: { color: "#818cf8", bg: "rgba(129,140,248,0.08)", dot: "#818cf8" },
  warn: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", dot: "#f59e0b" },
  error: { color: "#f43f5e", bg: "rgba(244,63,94,0.08)", dot: "#f43f5e" },
};

const systemMetrics = [
  { label: "CPU moyen (7j)", value: "23%", bar: 23, color: "#10b981" },
  { label: "RAM utilisée", value: "61%", bar: 61, color: "#38bdf8" },
  { label: "File d'attente IA", value: "4 tâches", bar: 8, color: "#818cf8" },
  { label: "Stockage total (plateforme)", value: "56.5 GB / 512 GB", bar: 11, color: "#f59e0b" },
];

export function AdminSystemPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Système</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>Santé des services et événements</p>
        </div>
        <button className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium transition-all" style={{ background: "rgba(129,140,248,0.12)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.2)" }}>
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Global status banner */}
      {services.some(s => s.status === "degraded") ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#f59e0b" }} />
          <p className="text-sm" style={{ color: "#fbbf24" }}>
            <span className="font-semibold">Dégradation partielle</span> — La base de données répond lentement. Surveillance active en cours.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#10b981" }} />
          <p className="text-sm" style={{ color: "#6ee7b7" }}>
            <span className="font-semibold">Tous les systèmes opérationnels</span>
          </p>
        </div>
      )}

      {/* Services grid */}
      <div className="grid grid-cols-3 gap-4">
        {services.map(svc => {
          const operational = svc.status === "operational";
          return (
            <div key={svc.name} className="rounded-xl p-5" style={{ background: "#13151e", border: `1px solid ${operational ? "rgba(255,255,255,0.06)" : "rgba(245,158,11,0.2)"}` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg" style={{ background: operational ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)" }}>
                  <svc.icon className="w-4 h-4" style={{ color: operational ? "#10b981" : "#f59e0b" }} />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: operational ? "#10b981" : "#f59e0b" }} />
                  <span className="text-xs font-medium" style={{ color: operational ? "#10b981" : "#f59e0b" }}>
                    {operational ? "Opérationnel" : "Dégradé"}
                  </span>
                </div>
              </div>
              <p className="text-sm font-semibold text-white mb-3">{svc.name}</p>
              <div className="flex items-center justify-between text-xs" style={{ color: "#6b7280" }}>
                <span>Latence: <span className="text-white font-medium">{svc.latency}</span></span>
                <span>Uptime: <span style={{ color: "#10b981" }}>{svc.uptime}</span></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* System metrics */}
      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-xl p-6 space-y-5" style={{ background: "#13151e", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" style={{ color: "#818cf8" }} />
            <h2 className="text-sm font-semibold text-white">Métriques serveur</h2>
          </div>
          {systemMetrics.map(m => (
            <div key={m.label} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: "#9ca3af" }}>{m.label}</span>
                <span className="font-semibold text-white">{m.value}</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${m.bar}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Quick admin actions */}
        <div className="rounded-xl p-6 space-y-4" style={{ background: "#13151e", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-sm font-semibold text-white">Actions rapides</h2>
          {[
            { label: "Déclencher un backup manuel", desc: "Sauvegarde immédiate de la BDD", color: "#38bdf8", bg: "rgba(56,189,248,0.1)" },
            { label: "Vider la file IA", desc: "Annuler les tâches en attente", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
            { label: "Envoyer une alerte aux organisations", desc: "Notification broadcast", color: "#818cf8", bg: "rgba(129,140,248,0.1)" },
            { label: "Purger les fichiers temporaires", desc: "Libérer l'espace de travail", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
          ].map(a => (
            <button
              key={a.label}
              className="w-full text-left px-4 py-3 rounded-lg transition-all"
              style={{ background: a.bg, border: `1px solid ${a.color}20` }}
            >
              <p className="text-sm font-medium" style={{ color: a.color }}>{a.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{a.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Event log */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ background: "#13151e", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Server className="w-4 h-4" style={{ color: "#818cf8" }} />
          <h2 className="text-sm font-semibold text-white">Journal des événements</h2>
        </div>
        <div style={{ background: "#0f1117" }}>
          {recentEvents.map((evt, i) => {
            const ls = levelStyle[evt.level];
            return (
              <div key={i} className="flex items-start gap-4 px-5 py-3.5" style={{ borderBottom: i < recentEvents.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: ls.bg }}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: ls.dot }} />
                <div className="flex-1">
                  <p className="text-sm" style={{ color: "#e5e7eb" }}>{evt.message}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#4b5563" }}>{evt.time}</p>
                </div>
                <span className="text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded" style={{ color: ls.color, background: `${ls.color}15` }}>
                  {evt.level}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
