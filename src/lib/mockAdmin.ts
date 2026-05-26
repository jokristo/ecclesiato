export type OrgPlan = "free" | "starter" | "pro" | "enterprise";
export type OrgStatus = "active" | "suspended" | "pending";

export interface Organization {
  id: string;
  name: string;
  pastor: string;
  email: string;
  city: string;
  country: string;
  plan: OrgPlan;
  status: OrgStatus;
  createdAt: string;
  memberCount: number;
  sermonsTotal: number;
  sermonsThisMonth: number;
  transcriptionsTotal: number;
  transcriptionsThisMonth: number;
  storageUsedMb: number;
  storageQuotaMb: number;
  aiCreditsUsed: number;
  aiCreditsQuota: number;
  lastActivity: string;
  monthlyRevenue: number;
  paymentStatus: "current" | "overdue" | "none";
  nextBillingDate: string | null;
}

export interface MonthlyRevenuePoint {
  month: string;
  revenue: number;
  orgs: number;
}

export interface UsagePoint {
  month: string;
  sermons: number;
  transcriptions: number;
  aiCalls: number;
}

export const mockOrganizations: Organization[] = [
  {
    id: "org-001",
    name: "Église Évangélique de Paris",
    pastor: "Pasteur Jean-Marc Bonheur",
    email: "contact@eep.fr",
    city: "Paris",
    country: "France",
    plan: "pro",
    status: "active",
    createdAt: "2024-03-15",
    memberCount: 4,
    sermonsTotal: 87,
    sermonsThisMonth: 12,
    transcriptionsTotal: 84,
    transcriptionsThisMonth: 11,
    storageUsedMb: 4320,
    storageQuotaMb: 10240,
    aiCreditsUsed: 8700,
    aiCreditsQuota: 15000,
    lastActivity: "2026-05-21",
    monthlyRevenue: 49,
    paymentStatus: "current",
    nextBillingDate: "2026-06-15",
  },
  {
    id: "org-002",
    name: "Assemblée de Grâce Kinshasa",
    pastor: "Pasteur Emmanuel Kabila",
    email: "admin@agk.cd",
    city: "Kinshasa",
    country: "RD Congo",
    plan: "enterprise",
    status: "active",
    createdAt: "2023-11-02",
    memberCount: 12,
    sermonsTotal: 214,
    sermonsThisMonth: 28,
    transcriptionsTotal: 210,
    transcriptionsThisMonth: 27,
    storageUsedMb: 18500,
    storageQuotaMb: 51200,
    aiCreditsUsed: 42000,
    aiCreditsQuota: 100000,
    lastActivity: "2026-05-22",
    monthlyRevenue: 149,
    paymentStatus: "current",
    nextBillingDate: "2026-06-02",
  },
  {
    id: "org-003",
    name: "Centre Chrétien de Marseille",
    pastor: "Pasteure Sophie Mercier",
    email: "info@ccm.org",
    city: "Marseille",
    country: "France",
    plan: "starter",
    status: "active",
    createdAt: "2024-07-20",
    memberCount: 2,
    sermonsTotal: 31,
    sermonsThisMonth: 4,
    transcriptionsTotal: 28,
    transcriptionsThisMonth: 4,
    storageUsedMb: 1540,
    storageQuotaMb: 3072,
    aiCreditsUsed: 1800,
    aiCreditsQuota: 5000,
    lastActivity: "2026-05-19",
    monthlyRevenue: 19,
    paymentStatus: "current",
    nextBillingDate: "2026-06-20",
  },
  {
    id: "org-004",
    name: "Communauté Foi et Vie",
    pastor: "Pasteur Alain Tshimanga",
    email: "contact@fvi.cd",
    city: "Lubumbashi",
    country: "RD Congo",
    plan: "free",
    status: "active",
    createdAt: "2025-01-10",
    memberCount: 1,
    sermonsTotal: 9,
    sermonsThisMonth: 2,
    transcriptionsTotal: 5,
    transcriptionsThisMonth: 1,
    storageUsedMb: 420,
    storageQuotaMb: 1024,
    aiCreditsUsed: 300,
    aiCreditsQuota: 500,
    lastActivity: "2026-05-15",
    monthlyRevenue: 0,
    paymentStatus: "none",
    nextBillingDate: null,
  },
  {
    id: "org-005",
    name: "Tabernacle de la Victoire",
    pastor: "Pasteur David Osei",
    email: "admin@tdv.gh",
    city: "Accra",
    country: "Ghana",
    plan: "pro",
    status: "suspended",
    createdAt: "2024-05-08",
    memberCount: 3,
    sermonsTotal: 56,
    sermonsThisMonth: 0,
    transcriptionsTotal: 50,
    transcriptionsThisMonth: 0,
    storageUsedMb: 2800,
    storageQuotaMb: 10240,
    aiCreditsUsed: 5600,
    aiCreditsQuota: 15000,
    lastActivity: "2026-04-30",
    monthlyRevenue: 0,
    paymentStatus: "overdue",
    nextBillingDate: "2026-05-08",
  },
  {
    id: "org-006",
    name: "Église Nouvelle Alliance Dakar",
    pastor: "Pasteur Ibrahim Fall",
    email: "contact@ena.sn",
    city: "Dakar",
    country: "Sénégal",
    plan: "starter",
    status: "active",
    createdAt: "2025-03-01",
    memberCount: 2,
    sermonsTotal: 18,
    sermonsThisMonth: 5,
    transcriptionsTotal: 17,
    transcriptionsThisMonth: 5,
    storageUsedMb: 890,
    storageQuotaMb: 3072,
    aiCreditsUsed: 950,
    aiCreditsQuota: 5000,
    lastActivity: "2026-05-20",
    monthlyRevenue: 19,
    paymentStatus: "current",
    nextBillingDate: "2026-06-01",
  },
  {
    id: "org-007",
    name: "Mission Évangélique Lyon",
    pastor: "Pasteur Pierre Fontaine",
    email: "mel@mission-lyon.fr",
    city: "Lyon",
    country: "France",
    plan: "free",
    status: "pending",
    createdAt: "2026-05-18",
    memberCount: 1,
    sermonsTotal: 0,
    sermonsThisMonth: 0,
    transcriptionsTotal: 0,
    transcriptionsThisMonth: 0,
    storageUsedMb: 0,
    storageQuotaMb: 1024,
    aiCreditsUsed: 0,
    aiCreditsQuota: 500,
    lastActivity: "2026-05-18",
    monthlyRevenue: 0,
    paymentStatus: "none",
    nextBillingDate: null,
  },
  {
    id: "org-008",
    name: "Église Bethel Abidjan",
    pastor: "Pasteure Marie-Claire Kouamé",
    email: "bethel@abidjan.ci",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    plan: "enterprise",
    status: "active",
    createdAt: "2023-08-14",
    memberCount: 18,
    sermonsTotal: 312,
    sermonsThisMonth: 41,
    transcriptionsTotal: 309,
    transcriptionsThisMonth: 40,
    storageUsedMb: 31000,
    storageQuotaMb: 102400,
    aiCreditsUsed: 78000,
    aiCreditsQuota: 200000,
    lastActivity: "2026-05-22",
    monthlyRevenue: 299,
    paymentStatus: "current",
    nextBillingDate: "2026-06-14",
  },
];

export const monthlyRevenue: MonthlyRevenuePoint[] = [
  { month: "Nov 2025", revenue: 384, orgs: 5 },
  { month: "Déc 2025", revenue: 422, orgs: 5 },
  { month: "Jan 2026", revenue: 465, orgs: 6 },
  { month: "Fév 2026", revenue: 502, orgs: 6 },
  { month: "Mar 2026", revenue: 534, orgs: 7 },
  { month: "Avr 2026", revenue: 555, orgs: 7 },
  { month: "Mai 2026", revenue: 535, orgs: 7 },
];

export const platformUsage: UsagePoint[] = [
  { month: "Nov 2025", sermons: 142, transcriptions: 138, aiCalls: 4200 },
  { month: "Déc 2025", sermons: 168, transcriptions: 162, aiCalls: 5100 },
  { month: "Jan 2026", sermons: 201, transcriptions: 196, aiCalls: 6300 },
  { month: "Fév 2026", sermons: 219, transcriptions: 215, aiCalls: 7100 },
  { month: "Mar 2026", sermons: 245, transcriptions: 241, aiCalls: 8400 },
  { month: "Avr 2026", sermons: 278, transcriptions: 273, aiCalls: 9800 },
  { month: "Mai 2026", sermons: 293, transcriptions: 288, aiCalls: 10400 },
];
