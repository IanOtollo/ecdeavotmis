import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft, Building2, Users, BookOpen, Database, Banknote,
  AlertTriangle, Receipt, GraduationCap, CheckCircle2, XCircle,
  Zap, Droplets, Star, Clock, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Id } from "../../convex/_generated/dataModel";

const TABS = [
  { key: "overview",    label: "Overview" },
  { key: "learners",    label: "Learners" },
  { key: "teachers",    label: "Teaching Staff" },
  { key: "infra",       label: "Infrastructure" },
  { key: "bank",        label: "Bank Accounts" },
  { key: "capitation",  label: "Capitation" },
  { key: "books",       label: "Books" },
  { key: "emergency",   label: "Emergencies" },
] as const;
type Tab = (typeof TABS)[number]["key"];

function Field({ label, value, mono }: { label: string; value?: string | number | boolean | null; mono?: boolean }) {
  if (value === undefined || value === null || value === "") return null;
  const disp = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-0.5">{label}</p>
      <p className={`text-sm font-medium text-foreground break-all ${mono ? "font-mono" : ""}`}>{disp}</p>
    </div>
  );
}

const COND_COLORS: Record<string, string> = {
  Excellent: "bg-green-100 text-green-800", Good: "bg-green-50 text-green-700",
  Fair: "bg-yellow-100 text-yellow-800", Poor: "bg-orange-100 text-orange-800",
  "Needs Urgent Repair": "bg-red-100 text-red-800", Condemned: "bg-red-200 text-red-900",
};
const RECON_COLORS: Record<string, string> = {
  "Reconciled": "bg-green-50 text-green-700", "Pending Reconciliation": "bg-yellow-50 text-yellow-700",
  "Variance Noted": "bg-orange-50 text-orange-700", "Disputed": "bg-red-50 text-red-700",
};
const SEV_SHORT: Record<string, string> = {
  "Low (Minor — no injuries, contained)": "Low",
  "Medium (Moderate — some impact, managed)": "Medium",
  "High (Serious — injuries or significant damage)": "High",
  "Critical (Life-threatening or mass casualty)": "Critical",
};
const SEV_COLORS: Record<string, string> = {
  Low: "bg-green-50 text-green-700", Medium: "bg-yellow-50 text-yellow-700",
  High: "bg-orange-50 text-orange-700", Critical: "bg-red-100 text-red-800",
};
const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-50 text-red-700", in_progress: "bg-yellow-50 text-yellow-700", resolved: "bg-green-50 text-green-700",
};
const BOOK_COND: Record<string, string> = {
  New: "bg-green-100 text-green-700", Good: "bg-green-50 text-green-600",
  Fair: "bg-yellow-50 text-yellow-700", Poor: "bg-orange-50 text-orange-700", Condemned: "bg-red-100 text-red-700",
};

export default function InstitutionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [learnerStatus, setLearnerStatus] = useState<"active" | "inactive" | "all">("active");

  const instId = id as Id<"institutions">;

  const institution   = useQuery(api.institutions.getById, { institutionId: instId });
  const learners      = useQuery(api.learners.list, { institutionId: instId });
  const teachers      = useQuery(api.teachers.list, { institutionId: instId });
  const infrastructure = useQuery(api.infrastructure.list, { institutionId: instId });
  const bankAccounts  = useQuery(api.bankAccounts.list, { institutionId: instId });
  const capitation    = useQuery(api.capitationReceipts.list, { institutionId: instId });
  const books         = useQuery(api.books.list, { institutionId: instId });
  const emergencies   = useQuery(api.emergencies.list, { institutionId: instId });

  if (institution === undefined) {
    return (
      <div className="page-container space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }
  if (!institution) {
    return (
      <div className="page-container text-center py-20">
        <p className="text-muted-foreground">Institution not found.</p>
        <Button variant="link" onClick={() => navigate("/institutions")}>Back to list</Button>
      </div>
    );
  }

  const isVT = institution.type === "Vocational Training";
  const activeLearners = (learners ?? []).filter(l => l.status === "active");
  const males   = activeLearners.filter(l => l.gender === "male").length;
  const females = activeLearners.filter(l => l.gender === "female").length;
  const openEmergencies = (emergencies ?? []).filter(e => e.status === "open").length;
  const infraBad = (infrastructure ?? []).filter(i => ["Poor","Needs Urgent Repair","Condemned"].includes(i.condition)).length;
  const totalCapitation = (capitation ?? []).reduce((s, r) => s + r.amount, 0);
  const totalBookCopies = (books ?? []).reduce((s, b) => s + b.quantity, 0);

  const kpis = [
    { icon: Users,      label: isVT ? "VT Learners" : "ECDE Learners", value: activeLearners.length, sub: `${males}M · ${females}F`, color: "" },
    { icon: GraduationCap, label: "Teaching Staff", value: teachers?.length ?? "—", sub: "", color: "" },
    { icon: Database,   label: "Infrastructure", value: infrastructure?.length ?? "—", sub: infraBad > 0 ? `${infraBad} need repair` : "All ok", color: infraBad > 0 ? "text-orange-600" : "" },
    { icon: BookOpen,   label: "Book Titles", value: books?.length ?? "—", sub: `${totalBookCopies} copies`, color: "" },
    { icon: Banknote,   label: "Bank Accounts", value: bankAccounts?.length ?? "—", sub: "", color: "" },
    { icon: Receipt,    label: "Total Capitation", value: totalCapitation > 0 ? `KES ${totalCapitation.toLocaleString()}` : "—", sub: `${capitation?.length ?? 0} receipts`, color: "" },
    { icon: AlertTriangle, label: "Open Incidents", value: openEmergencies, sub: "", color: openEmergencies > 0 ? "text-red-600" : "" },
  ];

  const filteredLearners = learnerStatus === "all" ? (learners ?? []) : (learners ?? []).filter(l => l.status === learnerStatus);

  return (
    <div className="page-container space-y-0">
      {/* Top header */}
      <div className="pb-5 border-b border-border mb-5">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => navigate("/institutions")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Institutions
          </button>
        </div>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="h-14 w-14 rounded-2xl bg-[#C8A96E]/10 flex items-center justify-center shrink-0">
            <Building2 className="h-7 w-7 text-[#C8A96E]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="section-heading">{institution.name}</h1>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${institution.status === "active" || !institution.status ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                {institution.status ?? "Active"}
              </span>
              <span className="text-xs bg-muted text-muted-foreground font-medium px-2 py-0.5 rounded-full">{institution.type}</span>
              {institution.sbpCompliance !== undefined && (
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${institution.sbpCompliance ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
                  {institution.sbpCompliance ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  SBP {institution.sbpCompliance ? "Compliant" : "Non-Compliant"}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {institution.subcounty} Sub-county · {institution.ward ?? ""}{institution.ward ? " Ward · " : ""}{institution.county} County
            </p>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
              <span>Code: <span className="font-mono font-semibold text-foreground">{institution.uniqueCode}</span></span>
              {institution.registrationNo && <span>Reg: <span className="font-mono text-foreground">{institution.registrationNo}</span></span>}
              {institution.zone && <span>Zone: {institution.zone}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {kpis.map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-3">
            <Icon className="h-3.5 w-3.5 text-muted-foreground mb-1.5" />
            <p className={`text-xl font-bold leading-none ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground font-medium mt-1 leading-tight">{label}</p>
            {sub && <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6 -mx-0 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.key
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
              }`}
            >
              {t.label}
              {t.key === "emergency" && openEmergencies > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">{openEmergencies}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Location & Address</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="County" value={institution.county} />
                <Field label="Sub-county" value={institution.subcounty} />
                <Field label="Ward" value={institution.ward} />
                <Field label="Zone" value={institution.zone} />
                <Field label="Location" value={institution.location} />
                {institution.geoLat && <Field label="GPS" value={`${institution.geoLat}, ${institution.geoLng}`} mono />}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Registration & Compliance</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Unique Code" value={institution.uniqueCode} mono />
                <Field label="Registration No." value={institution.registrationNo} mono />
                <Field label="Registration Date" value={institution.registrationDate} />
                <Field label="KRA PIN" value={institution.kraPin} mono />
                <Field label="Ownership" value={institution.ownership} />
                <Field label="Level" value={institution.level} />
                <Field label="Education System" value={institution.educationSystem} />
                <Field label="SBP Compliant" value={institution.sbpCompliance} />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nearest Facilities</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Nearest Town" value={institution.nearestTown} />
                <Field label="Nearest Police" value={institution.nearestPolice} />
                <Field label="Nearest Health" value={institution.nearestHealth} />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Learner Snapshot</p>
              {activeLearners.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active learners yet</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm border-b border-border/50 pb-2 mb-2">
                    <span className="text-muted-foreground font-medium">Active total</span>
                    <span className="font-bold">{activeLearners.length}</span>
                  </div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Male</span><span className="font-medium">{males}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Female</span><span className="font-medium">{females}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">With disability</span><span className="font-medium">{activeLearners.filter(l=>l.hasDisability).length}</span></div>
                  {(()=>{
                    const groups = [...new Set(activeLearners.map(l=>l.classLevel).filter(Boolean))].sort().map(c=>({name:c!,count:activeLearners.filter(l=>l.classLevel===c).length}));
                    return groups.length > 0 ? (
                      <div className="pt-2 border-t border-border/50 space-y-1.5">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{isVT?"By Year / Level":"By Class"}</p>
                        {groups.map(g=>(
                          <div key={g.name} className="flex justify-between text-sm"><span className="text-muted-foreground">{g.name}</span><span className="font-medium">{g.count}</span></div>
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── LEARNERS ── */}
      {tab === "learners" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-muted-foreground">{filteredLearners.length} learner(s) shown</p>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
              <select value={learnerStatus} onChange={e=>setLearnerStatus(e.target.value as any)} className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
          {learners === undefined ? (
            <div className="space-y-2">{[...Array(5)].map((_,i)=><div key={i} className="h-12 bg-muted rounded-xl animate-pulse"/>)}</div>
          ) : filteredLearners.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center"><Users className="h-10 w-10 text-muted-foreground/30 mb-3"/><p className="text-muted-foreground text-sm">No learners found</p></div>
          ) : (
            <div className="rounded-xl border border-border overflow-x-auto bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr>
                  {["UPI","Name","Gender","DOB",isVT?"Course Year":"Class","Admission Date","Status",""].map(h=>(
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-border/60">
                  {filteredLearners.map(l=>(
                    <tr key={l._id} onClick={()=>navigate(`/learners/${l._id}`)} className="hover:bg-muted/30 transition-colors cursor-pointer">
                      <td className="px-4 py-3"><span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{l.upi}</span></td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{l.firstName} {l.lastName}{l.otherName?` ${l.otherName}`:""}</td>
                      <td className="px-4 py-3 capitalize text-muted-foreground text-xs">{l.gender}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{l.dob}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{l.class??l.courseYear??"—"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{l.admissionDate}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${l.status==="active"?"bg-green-50 text-green-700":"bg-muted text-muted-foreground"}`}>{l.status}</span>
                      </td>
                      <td className="px-4 py-3"><ChevronRight className="h-4 w-4 text-muted-foreground/40"/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TEACHERS ── */}
      {tab === "teachers" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{teachers?.length ?? 0} staff member(s)</p>
          {teachers === undefined ? (
            <div className="space-y-2">{[...Array(3)].map((_,i)=><div key={i} className="h-12 bg-muted rounded-xl animate-pulse"/>)}</div>
          ) : teachers.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center"><GraduationCap className="h-10 w-10 text-muted-foreground/30 mb-3"/><p className="text-muted-foreground text-sm">No teaching staff recorded</p></div>
          ) : (
            <div className="rounded-xl border border-border overflow-x-auto bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr>
                  {["Name","Gender","Role","Employment","Qualification","TSC No.","Status"].map(h=>(
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-border/60">
                  {teachers.map(t=>(
                    <tr key={t._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{t.firstName} {t.lastName}{t.otherName?` ${t.otherName}`:""}</td>
                      <td className="px-4 py-3 capitalize text-muted-foreground text-xs">{t.gender}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{t.role}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{t.employmentType??"—"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{t.qualification??"—"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.tscNo??"—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.status==="active"?"bg-green-50 text-green-700":"bg-muted text-muted-foreground"}`}>{t.status??"active"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── INFRASTRUCTURE ── */}
      {tab === "infra" && (
        <div className="space-y-4">
          {infrastructure===undefined ? (
            <div className="space-y-2">{[...Array(3)].map((_,i)=><div key={i} className="h-12 bg-muted rounded-xl animate-pulse"/>)}</div>
          ) : infrastructure.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center"><Database className="h-10 w-10 text-muted-foreground/30 mb-3"/><p className="text-muted-foreground text-sm">No infrastructure records</p></div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                {[
                  {label:"Total Assets",value:infrastructure.length},
                  {label:"Need Repair",value:infraBad,cls:infraBad>0?"text-red-600":""},
                  {label:"Est. Value",value:`KES ${(infrastructure.reduce((s,i)=>s+(i.estimatedCost??0),0)).toLocaleString()}`},
                  {label:"Categories",value:new Set(infrastructure.map(i=>i.category)).size},
                ].map(({label,value,cls}:{label:string;value:any;cls?:string})=>(
                  <div key={label} className="rounded-xl border border-border bg-card p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
                    <p className={`text-lg font-bold mt-0.5 ${cls??""}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-border overflow-x-auto bg-card">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr>
                    {["Category","Description","Qty","Condition","Ownership","Est. Cost","Utilities"].map(h=>(
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-border/60">
                    {infrastructure.map(i=>(
                      <tr key={i._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{i.category}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs">
                          <p>{i.description}</p>
                          {i.conditionNotes&&<p className="italic text-muted-foreground/60 mt-0.5">{i.conditionNotes}</p>}
                        </td>
                        <td className="px-4 py-3">{i.quantity}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${COND_COLORS[i.condition]??""}`}>{i.condition}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{i.ownershipType??"—"}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{i.estimatedCost?`KES ${i.estimatedCost.toLocaleString()}`:"—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {i.hasElectricity&&<Zap className="h-3.5 w-3.5 text-yellow-500" title="Electricity"/>}
                            {i.hasWater&&<Droplets className="h-3.5 w-3.5 text-blue-500" title="Water"/>}
                            {!i.hasElectricity&&!i.hasWater&&<span className="text-muted-foreground/40 text-xs">—</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── BANK ACCOUNTS ── */}
      {tab === "bank" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{bankAccounts?.length ?? 0} account(s) on record</p>
          {bankAccounts===undefined ? (
            <div className="space-y-3">{[...Array(2)].map((_,i)=><div key={i} className="h-28 bg-muted rounded-xl animate-pulse"/>)}</div>
          ) : bankAccounts.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center"><Banknote className="h-10 w-10 text-muted-foreground/30 mb-3"/><p className="text-muted-foreground text-sm">No bank accounts on record</p></div>
          ) : (
            <div className="space-y-4">
              {bankAccounts.map(acc=>(
                <div key={acc._id} className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-5 py-4 bg-muted/30 border-b border-border flex items-center gap-3 flex-wrap">
                    <Banknote className="h-5 w-5 text-muted-foreground shrink-0"/>
                    <div>
                      <p className="font-semibold">{acc.bankName}</p>
                      <p className="text-xs text-muted-foreground">{acc.branch}</p>
                    </div>
                    {acc.isPrimary&&<span className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full font-medium"><Star className="h-3 w-3"/>Primary</span>}
                    {acc.isCapitationAccount&&<span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">Capitation</span>}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${acc.accountStatus==="Active"?"bg-green-100 text-green-700":"bg-muted text-muted-foreground"}`}>{acc.accountStatus??"Active"}</span>
                    {acc.accountType&&<span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{acc.accountType}</span>}
                  </div>
                  <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                    <Field label="Account Name" value={acc.accountName} />
                    <Field label="Account Number" value={acc.accountNo} mono />
                    <Field label="Date Opened" value={acc.openingDate} />
                    <Field label="Signatory 1" value={acc.signatory1Name} />
                    <Field label="S1 Role" value={acc.signatory1Role} />
                    <Field label="S1 ID No." value={acc.signatory1IdNo} />
                    <Field label="Signatory 2" value={acc.signatory2Name} />
                    <Field label="S2 Role" value={acc.signatory2Role} />
                    <Field label="S2 ID No." value={acc.signatory2IdNo} />
                    <Field label="Bank Contact" value={acc.bankContactPerson} />
                    <Field label="Contact Phone" value={acc.bankContactPhone} />
                    <Field label="Notes" value={acc.notes} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CAPITATION ── */}
      {tab === "capitation" && (
        <div className="space-y-4">
          {(capitation?.length??0)>0&&(
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[{label:"Total Receipts",value:capitation?.length??0},{label:"Total Disbursed",value:`KES ${totalCapitation.toLocaleString()}`},{label:"Reconciled",value:`${(capitation??[]).filter(r=>r.reconciliationStatus==="Reconciled").length} / ${capitation?.length??0}`}]
                .map(({label,value})=><div key={label} className="rounded-xl border border-border bg-card p-3"><p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p><p className="text-lg font-bold mt-0.5">{value}</p></div>)}
            </div>
          )}
          {capitation===undefined ? (
            <div className="space-y-2">{[...Array(3)].map((_,i)=><div key={i} className="h-12 bg-muted rounded-xl animate-pulse"/>)}</div>
          ) : capitation.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center"><Receipt className="h-10 w-10 text-muted-foreground/30 mb-3"/><p className="text-muted-foreground text-sm">No capitation receipts recorded</p></div>
          ) : (
            <div className="rounded-xl border border-border overflow-x-auto bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr>
                  {["Receipt No.","Amount (KES)","Term / FY","Disburse Date","Deposit Date","Source","Learners","Status"].map(h=>(
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-border/60">
                  {capitation.map(r=>(
                    <tr key={r._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{r.receiptNo}</td>
                      <td className="px-4 py-3 font-semibold">KES {r.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{r.term} · {r.financialYear}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{r.disbursementDate}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{r.depositDate??"—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[140px] truncate">{r.disbursementSource??"—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.learnersCount??"—"}</td>
                      <td className="px-4 py-3">
                        {r.reconciliationStatus&&<span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${RECON_COLORS[r.reconciliationStatus]??""}`}>{r.reconciliationStatus}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── BOOKS ── */}
      {tab === "books" && (
        <div className="space-y-4">
          {(books?.length??0)>0&&(
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[{label:"Titles",value:books?.length??0},{label:"Total Copies",value:totalBookCopies},{label:"In Circulation",value:(books??[]).reduce((s,b)=>s+(b.inCirculation??0),0)},{label:"Est. Value",value:`KES ${(books??[]).reduce((s,b)=>s+(b.costPerUnit??0)*b.quantity,0).toLocaleString()}`}]
                .map(({label,value})=><div key={label} className="rounded-xl border border-border bg-card p-3"><p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p><p className="text-lg font-bold mt-0.5">{value}</p></div>)}
            </div>
          )}
          {books===undefined ? (
            <div className="space-y-2">{[...Array(4)].map((_,i)=><div key={i} className="h-12 bg-muted rounded-xl animate-pulse"/>)}</div>
          ) : books.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center"><BookOpen className="h-10 w-10 text-muted-foreground/30 mb-3"/><p className="text-muted-foreground text-sm">No books in the inventory</p></div>
          ) : (
            <div className="rounded-xl border border-border overflow-x-auto bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr>
                  {["Title","Author","Subject","Grade","Qty","In Circ.","Condition","Cost/Unit"].map(h=>(
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-border/60">
                  {books.map(b=>(
                    <tr key={b._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium max-w-[180px]">
                        <p className="truncate">{b.title}</p>
                        {b.isbn&&<p className="text-xs font-mono text-muted-foreground">{b.isbn}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{b.author??"—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{b.subject??"—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{b.gradeLevel??"—"}</td>
                      <td className="px-4 py-3 font-medium">{b.quantity}</td>
                      <td className="px-4 py-3 text-muted-foreground">{b.inCirculation??"—"}</td>
                      <td className="px-4 py-3">
                        {b.bookCondition&&<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BOOK_COND[b.bookCondition]??""}`}>{b.bookCondition}</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{b.costPerUnit?`KES ${b.costPerUnit.toLocaleString()}`:"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── EMERGENCIES ── */}
      {tab === "emergency" && (
        <div className="space-y-4">
          {(emergencies?.length??0)>0&&(
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {label:"Total",value:emergencies?.length??0,cls:""},
                {label:"Open",value:openEmergencies,cls:openEmergencies>0?"text-red-600":""},
                {label:"In Progress",value:(emergencies??[]).filter(e=>e.status==="in_progress").length,cls:""},
                {label:"Resolved",value:(emergencies??[]).filter(e=>e.status==="resolved").length,cls:"text-green-600"},
              ].map(({label,value,cls}:{label:string;value:any;cls:string})=>(
                <div key={label} className="rounded-xl border border-border bg-card p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
                  <p className={`text-lg font-bold mt-0.5 ${cls}`}>{value}</p>
                </div>
              ))}
            </div>
          )}
          {emergencies===undefined ? (
            <div className="space-y-2">{[...Array(3)].map((_,i)=><div key={i} className="h-20 bg-muted rounded-xl animate-pulse"/>)}</div>
          ) : emergencies.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center"><AlertTriangle className="h-10 w-10 text-muted-foreground/30 mb-3"/><p className="text-muted-foreground text-sm">No incidents on record</p></div>
          ) : (
            <div className="space-y-3">
              {emergencies.map(inc=>(
                <div key={inc._id} className={`rounded-xl border bg-card overflow-hidden ${inc.status==="open"?"border-red-200":inc.status==="in_progress"?"border-yellow-200":"border-border"}`}>
                  <div className="px-5 py-4 border-b border-border/60 flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${inc.status==="open"?"bg-red-100":inc.status==="in_progress"?"bg-yellow-100":"bg-green-100"}`}>
                        <AlertTriangle className={`h-4 w-4 ${inc.status==="open"?"text-red-600":inc.status==="in_progress"?"text-yellow-600":"text-green-600"}`}/>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{inc.incidentType}</p>
                          {inc.severity&&(()=>{const s=SEV_SHORT[inc.severity]??inc.severity;return<span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SEV_COLORS[s]??""}`}>{s}</span>;})()}
                          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[inc.status]}`}>
                            {inc.status==="resolved"?<CheckCircle2 className="h-3 w-3"/>:inc.status==="in_progress"?<Clock className="h-3 w-3"/>:<AlertTriangle className="h-3 w-3"/>}
                            {inc.status.replace("_"," ")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{inc.incidentDate}{inc.incidentTime?` at ${inc.incidentTime}`:""}{inc.locationWithin?` · ${inc.locationWithin}`:""}</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-4 space-y-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">{inc.description}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs mt-1">
                      {inc.affectedCount!=null&&<span className="text-muted-foreground"><span className="font-semibold text-foreground">{inc.affectedCount}</span> affected</span>}
                      {inc.injuries&&<span className="text-muted-foreground">Injuries: <span className="text-foreground">{inc.injuries}</span></span>}
                      {inc.policeRef&&<span className="text-muted-foreground">Police ref: <span className="font-mono text-foreground">{inc.policeRef}</span></span>}
                      {inc.financialImpact!=null&&<span className="text-muted-foreground">Financial impact: <span className="font-semibold text-foreground">KES {inc.financialImpact.toLocaleString()}</span></span>}
                      {inc.parentNotified&&<span className="text-green-700 font-medium">Parents notified</span>}
                      {inc.insuranceClaim&&<span className="text-blue-700 font-medium">Insurance claim filed</span>}
                    </div>
                    {inc.response&&<p className="text-xs text-muted-foreground border-t border-border/50 pt-2"><span className="font-semibold text-foreground">Response: </span>{inc.response}</p>}
                    {inc.correctiveMeasures&&<p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Corrective measures: </span>{inc.correctiveMeasures}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
