import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNavigate } from "react-router-dom";
import {
  Building2, Users, GraduationCap, AlertTriangle, Plus, UserPlus,
  Activity, TrendingUp, ClipboardList, BookOpen, FileBarChart,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

/* Neutral chart palette — no bright accent colors */
const CHART_COLORS = [
  "hsl(215 25% 40%)",
  "hsl(215 15% 56%)",
  "hsl(215 10% 70%)",
  "hsl(215 20% 48%)",
  "hsl(215 10% 80%)",
];

/* ── KPI card — stacks vertically on mobile, horizontal on sm+ ── */
function KpiCard({
  label, value, sub, icon: Icon,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
}) {
  return (
    <div
      className="bg-card rounded-xl border border-border p-4 sm:p-5 flex flex-col gap-3 min-w-0 overflow-hidden"
      style={{ boxShadow: "0 1px 3px hsl(220 15% 65% / 0.10), 0 4px 14px hsl(220 15% 65% / 0.07)" }}
    >
      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{value}</p>
        <p className="text-xs font-semibold text-muted-foreground mt-1.5 uppercase tracking-wide leading-tight">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/60 mt-1 break-words">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Chart panel ── */
function ChartPanel({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-card rounded-xl border border-border p-5"
      style={{ boxShadow: "0 1px 3px hsl(220 15% 65% / 0.08), 0 4px 14px hsl(220 15% 65% / 0.05)" }}
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/60">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
      <Activity className="h-8 w-8 opacity-15" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

/* ── Simple page heading ── */
function PageHeading({ title, subtitle, actions }: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-border mb-6">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   County Chief Dashboard
═══════════════════════════════════════════════════ */
function CountyDashboard({ kpis }: { kpis: NonNullable<ReturnType<typeof useQuery<typeof api.dashboard.countyKpis>>> }) {
  const navigate = useNavigate();

  return (
    <div className="page-container space-y-6">
      <PageHeading
        title="County Overview"
        subtitle="Busia County Education & Vocational Training — live operational data"
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => navigate("/institutions")} className="gap-1.5 text-xs">
              <Building2 className="h-3.5 w-3.5" /> Institutions
            </Button>
            <Button size="sm" onClick={() => navigate("/institutions")} className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Register
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Registered Institutions"
          value={kpis.totalInstitutions}
          sub={`ECDE: ${kpis.institutionsByType.find(t => t.name === "ECDE")?.value ?? 0} · VT: ${kpis.institutionsByType.find(t => t.name === "Vocational Training")?.value ?? 0}`}
          icon={Building2}
        />
        <KpiCard
          label="Active Learners"
          value={kpis.totalActiveLearners}
          sub={`ECDE: ${kpis.ecdeLearners} · VT: ${kpis.vocationalLearners}`}
          icon={GraduationCap}
        />
        <KpiCard label="Teaching Staff"   value={kpis.totalTeachers}   icon={Users} />
        <KpiCard label="Open Emergencies" value={kpis.openEmergencies} icon={AlertTriangle} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <ChartPanel title="Learners per Institution" icon={TrendingUp}>
          {kpis.learnersPerInstitution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={kpis.learnersPerInstitution} margin={{ left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 92%)" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid hsl(220 16% 88%)" }} />
                <Bar dataKey="count" fill="hsl(215 25% 40%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No institutions registered yet" />
          )}
        </ChartPanel>

        <ChartPanel title="Institutions by Type" icon={Building2}>
          {kpis.institutionsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={kpis.institutionsByType}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  outerRadius={78}
                  innerRadius={36}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {kpis.institutionsByType.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid hsl(220 16% 88%)" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No institution type data yet" />
          )}
        </ChartPanel>

        <ChartPanel title="Monthly Admissions (last 6 months)" icon={Activity}>
          {kpis.admissionsByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={kpis.admissionsByMonth} margin={{ left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 92%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid hsl(220 16% 88%)" }} />
                <Bar dataKey="count" fill="hsl(215 20% 52%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No admissions in the last 6 months" />
          )}
        </ChartPanel>

        <ChartPanel title="Emergencies by Status" icon={AlertTriangle}>
          {kpis.emergenciesByStatus.some((e) => e.count > 0) ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={kpis.emergenciesByStatus} margin={{ left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 92%)" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid hsl(220 16% 88%)" }} />
                <Bar dataKey="count" fill="hsl(215 15% 60%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No emergencies on record" />
          )}
        </ChartPanel>
      </div>

      {/* Quick actions */}
      <div
        className="rounded-xl border border-border bg-card p-5"
        style={{ boxShadow: "0 1px 3px hsl(220 15% 65% / 0.08)" }}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
          <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
          <span className="section-label">County-wide</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Register Institution", icon: Building2,    url: "/institutions" },
            { label: "Add User",             icon: UserPlus,     url: "/admin/users" },
            { label: "Search Learners",      icon: GraduationCap, url: "/learners/search" },
            { label: "Audit Log",            icon: ClipboardList, url: "/admin/audit" },
            { label: "County Report",        icon: FileBarChart,  url: "/reports/admission" },
          ].map(({ label, icon: Icon, url }) => (
            <button
              key={url}
              onClick={() => navigate(url)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-background text-xs font-medium text-foreground hover:bg-muted hover:border-border transition-all duration-150"
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              {label}
              <ChevronRight className="h-3 w-3 opacity-30 ml-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Institution Staff Dashboard
═══════════════════════════════════════════════════ */
function InstitutionDashboard({ kpis }: { kpis: NonNullable<ReturnType<typeof useQuery<typeof api.dashboard.countyKpis>>> }) {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const isAdmin   = user?.role === "institution_admin";
  const isEcde    = kpis.institutionType !== "Vocational Training";
  const isVt      = kpis.institutionType === "Vocational Training";
  const todayLabel = new Date().toLocaleDateString("en-KE", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const captureUrl   = isEcde ? "/learners/capture/ecde" : "/learners/capture/vocational";
  const captureLabel = isEcde ? "Capture ECDE Learner" : "Capture VT Learner";

  const actionCards = [
    { label: captureLabel,           icon: UserPlus,      url: captureUrl,                    desc: `Register a new ${isEcde ? "ECDE" : "vocational"} learner and issue UPI` },
    { label: "View All Learners",    icon: Users,         url: "/learners/view",              desc: "Browse and manage your full learner list" },
    { label: "Search Learners",      icon: Activity,      url: "/learners/search",            desc: "Find a learner by name, UPI, or status" },
    { label: "Teaching Staff",       icon: UserPlus,      url: "/institution/teachers",       desc: "Manage teachers and instructors" },
    { label: "File Emergency Report",icon: AlertTriangle, url: "/institution/emergency",      desc: "Report an incident at your institution" },
    ...(isAdmin ? [{ label: "Institution Reports", icon: FileBarChart, url: "/reports/my-learners", desc: "Download data exports for your institution" }] : []),
  ];

  return (
    <div className="page-container space-y-6">
      <PageHeading
        title={kpis.institutionName ?? "My Institution"}
        subtitle={todayLabel}
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => navigate(captureUrl)} className="gap-1.5 text-xs">
              <UserPlus className="h-3.5 w-3.5" /> {captureLabel}
            </Button>
            <Button size="sm" onClick={() => navigate("/institution/emergency")} className="gap-1.5 text-xs">
              <AlertTriangle className="h-3.5 w-3.5" /> File Emergency
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Active Learners"
          value={kpis.totalActiveLearners}
          icon={GraduationCap}
        />
        <KpiCard label="Teaching Staff"   value={kpis.totalTeachers}   icon={Users} />
        <KpiCard label="Open Emergencies" value={kpis.openEmergencies} icon={AlertTriangle} />
        {isEcde
          ? <KpiCard label="ECDE Learners"       value={kpis.ecdeLearners}       icon={BookOpen} />
          : <KpiCard label="Vocational Learners"  value={kpis.vocationalLearners} icon={BookOpen} />
        }
      </div>

      {/* Operational action cards */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="section-label">Operational actions</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actionCards.map(({ label, icon: Icon, url, desc }) => (
            <button
              key={url}
              onClick={() => navigate(url)}
              className="text-left rounded-xl border border-border bg-card p-4 flex items-start gap-3.5 transition-all duration-150 group hover:bg-muted/40 hover:shadow-md"
              style={{ boxShadow: "0 1px 3px hsl(220 15% 65% / 0.08), 0 2px 8px hsl(220 15% 65% / 0.05)" }}
            >
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-foreground/80 transition-colors">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom info panels */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          {
            title: "Institution Management",
            links: [
              { label: "Update bio-data",       url: "/institution/bio-data" },
              { label: "Infrastructure records", url: "/institution/infrastructure" },
              ...(isAdmin ? [
                { label: "Bank account details",   url: "/institution/bank" },
                { label: "Capitation receipts",    url: "/institution/capitation" },
                { label: "School books inventory", url: "/institution/books" },
              ] : []),
            ],
          },
          {
            title: "Reports & Exports",
            links: [
              { label: "Admission report (CSV)", url: "/reports/admission" },
              { label: "My learners list",       url: "/reports/my-learners" },
              { label: "UPI register",           url: "/reports/upi" },
              { label: "Institution statistics", url: "/reports/statistics" },
            ],
          },
        ].map(({ title, links }) => (
          <div
            key={title}
            className="rounded-xl border border-border bg-card p-5"
            style={{ boxShadow: "0 1px 3px hsl(220 15% 65% / 0.08)" }}
          >
            <h3 className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-border/60">{title}</h3>
            <div className="space-y-1">
              {links.map(({ label, url }) => (
                <button
                  key={url}
                  onClick={() => navigate(url)}
                  className="w-full text-left text-xs text-muted-foreground hover:text-foreground flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted transition-colors"
                >
                  <ChevronRight className="h-3 w-3 opacity-40 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Skeleton loader ── */
function DashboardSkeleton() {
  return (
    <div className="page-container space-y-6 animate-pulse">
      <div className="h-12 w-72 rounded bg-muted" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted" />)}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        {[...Array(4)].map((_, i) => <div key={i} className="h-56 rounded-xl bg-muted" />)}
      </div>
    </div>
  );
}

/* ── Main export ── */
export default function Dashboard() {
  const { user } = useCurrentUser();
  const kpis = useQuery(api.dashboard.countyKpis);

  if (!kpis || !user) return <DashboardSkeleton />;
  if (user.role === "super_admin") return <CountyDashboard kpis={kpis} />;
  return <InstitutionDashboard kpis={kpis} />;
}
