import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";
import { Download, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

function exportCSV(data: any[], filename: string) {
  if (!data.length) { toast.error("No data to export"); return; }
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((r) => Object.values(r).map((v) => JSON.stringify(v ?? "")).join(",")).join("\n");
  const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success("Report exported");
}

export default function AdmissionReport() {
  const { user } = useCurrentUser();
  const isSuperAdmin = user?.role === "super_admin";
  const institutionId = !isSuperAdmin ? user?.institutionId : undefined;

  // For institution users: fetch their institution to know the type
  const institution = useQuery(
    api.institutions.getById,
    institutionId ? { institutionId: institutionId as Id<"institutions"> } : "skip"
  );
  const isVT = institution?.type === "Vocational Training";

  // Super admin can filter; institution users are locked to their program type
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "all">("active");

  const queryArgs: any = {};
  if (!isSuperAdmin && institutionId) queryArgs.institutionId = institutionId;
  // institution users are locked to their program type — no manual filter needed
  if (!isSuperAdmin && institution) {
    queryArgs.programType = isVT ? "vocational" : "ecde";
  }
  if (statusFilter !== "all") queryArgs.status = statusFilter;

  const learners = useQuery(api.learners.list, queryArgs);
  const institutions = useQuery(api.institutions.list);

  function getInstitutionName(id: string) {
    return institutions?.find((i) => i._id === id)?.name ?? "—";
  }

  const rows = learners ?? [];

  // Gender breakdown
  const males   = rows.filter(l => l.gender === "male").length;
  const females = rows.filter(l => l.gender === "female").length;

  const exportData = rows.map((l) => ({
    UPI: l.upi,
    "First Name": l.firstName,
    "Last Name": l.lastName,
    "Other Name": l.otherName ?? "",
    Gender: l.gender,
    DOB: l.dob,
    Nationality: l.nationality ?? "",
    "Special Needs": l.hasDisability ? "Yes" : "No",
    Program: l.programType,
    Class: l.classLevel ?? "",
    "Admission Date": l.admissionDate,
    Institution: isSuperAdmin ? getInstitutionName(l.institutionId) : institution?.name ?? "",
    Status: l.status,
  }));

  const programLabel = isSuperAdmin ? "All Programs" : isVT ? "Vocational Training" : "ECDE";

  return (
    <div className="page-container space-y-6">
      <div className="flex items-start justify-between pb-5 border-b border-border flex-wrap gap-3">
        <div>
          <h1 className="section-heading">Admission Report</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{programLabel} · {rows.length} learner(s)</p>
        </div>
        <Button onClick={() => exportCSV(exportData, "admission-report.csv")} variant="outline" className="gap-1.5" disabled={!rows.length}>
          <Download className="h-4 w-4"/> Export CSV
        </Button>
      </div>

      {/* Summary cards */}
      {rows.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[{label:"Total",value:rows.length},{label:"Male",value:males},{label:"Female",value:females},{label:"Program",value:programLabel}]
            .map(({label,value})=><div key={label} className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p><p className="text-lg font-bold mt-1">{value}</p></div>)}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)} className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {learners === undefined ? (
        <div className="space-y-2">{[...Array(6)].map((_,i)=><div key={i} className="h-12 bg-muted rounded-xl animate-pulse"/>)}</div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileBarChart className="h-10 w-10 text-muted-foreground/30 mb-3"/>
          <p className="text-muted-foreground text-sm">No learners found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>{(isSuperAdmin
                  ? ["UPI","Name","Gender","DOB","Nationality","Spc. Needs","Program","Class","Admission Date","Institution","Status"]
                  : ["UPI","Name","Gender","DOB","Nationality","Special Needs","Class / Year","Admission Date","Status"]
                ).map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map(l=>(
                <tr key={l._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3"><span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{l.upi}</span></td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{l.firstName} {l.lastName}{l.otherName?` ${l.otherName}`:""}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{l.gender}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{l.dob}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{l.nationality??"—"}</td>
                  <td className="px-4 py-3 text-xs">{l.hasDisability?<span className="text-blue-700 font-medium">Yes</span>:<span className="text-muted-foreground">No</span>}</td>
                  {isSuperAdmin&&<td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium uppercase">{l.programType}</span></td>}
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{l.classLevel??"—"}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{l.admissionDate}</td>
                  {isSuperAdmin&&<td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{getInstitutionName(l.institutionId)}</td>}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${l.status==="active"?"bg-green-50 text-green-700":"bg-muted text-muted-foreground"}`}>{l.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
