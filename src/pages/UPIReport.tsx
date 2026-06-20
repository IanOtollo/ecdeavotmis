import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Download, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
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
  toast.success("UPI report exported");
}

export default function UPIReport() {
  const { user } = useCurrentUser();
  const isSuperAdmin = user?.role === "super_admin";
  const institutionId = !isSuperAdmin ? user?.institutionId : undefined;

  const institution = useQuery(
    api.institutions.getById,
    institutionId ? { institutionId: institutionId as Id<"institutions"> } : "skip"
  );
  const isVT = institution?.type === "Vocational Training";

  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Super admin can filter by program type; institution users see only their type
  const [programFilter, setProgramFilter] = useState<"all" | "ecde" | "vocational">("all");

  const queryArgs: any = {};
  if (institutionId) queryArgs.institutionId = institutionId;
  if (!isSuperAdmin && institution) queryArgs.programType = isVT ? "vocational" : "ecde";
  else if (isSuperAdmin && programFilter !== "all") queryArgs.programType = programFilter;
  if (statusFilter !== "all") queryArgs.status = statusFilter;

  const learners = useQuery(api.learners.list, queryArgs);
  const institutions = useQuery(api.institutions.list);

  function getInstitutionName(id: string) {
    return institutions?.find((i) => i._id === id)?.name ?? "—";
  }

  const rows = learners ?? [];

  const exportData = rows.map((l) => ({
    UPI: l.upi,
    "First Name": l.firstName,
    "Last Name": l.lastName,
    "Other Name": l.otherName ?? "",
    Gender: l.gender,
    DOB: l.dob,
    "Birth Cert No.": l.birthCertNo ?? "",
    "National ID": l.nationalId ?? "",
    Nationality: l.nationality ?? "",
    Program: l.programType,
    Class: l.classLevel ?? "",
    "Admission Date": l.admissionDate,
    Status: l.status,
    Institution: isSuperAdmin ? getInstitutionName(l.institutionId) : institution?.name ?? "",
  }));

  const typeLabel = isSuperAdmin ? "All Programs" : isVT ? "Vocational Training" : "ECDE";

  return (
    <div className="page-container space-y-6">
      <div className="flex items-start justify-between pb-5 border-b border-border flex-wrap gap-3">
        <div>
          <h1 className="section-heading">UPI Register</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{typeLabel} · {rows.length} issued UPI(s)</p>
        </div>
        <Button onClick={() => exportCSV(exportData, "upi-register.csv")} variant="outline" className="gap-1.5" disabled={!rows.length}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {rows.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[{label:"Total UPIs",value:rows.length},{label:"Male",value:rows.filter(l=>l.gender==="male").length},{label:"Female",value:rows.filter(l=>l.gender==="female").length}]
            .map(({label,value})=><div key={label} className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p><p className="text-xl font-bold mt-1">{value}</p></div>)}
        </div>
      )}

      <div className="flex items-center gap-4 flex-wrap">
        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Program</label>
            <select value={programFilter} onChange={e=>setProgramFilter(e.target.value as any)} className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm">
              <option value="all">All</option>
              <option value="ecde">ECDE</option>
              <option value="vocational">Vocational</option>
            </select>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)} className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {learners === undefined ? (
        <div className="space-y-2">{[...Array(6)].map((_,i)=><div key={i} className="h-12 bg-muted rounded-xl animate-pulse"/>)}</div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileBarChart className="h-10 w-10 text-muted-foreground/30 mb-3"/>
          <p className="text-muted-foreground text-sm">No UPIs issued yet</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>{(isSuperAdmin
                  ? ["UPI","Name","Gender","DOB","Nationality","Program","Class","Admission Date","Status","Institution"]
                  : ["UPI","Name","Gender","DOB","Birth Cert No.",isVT?"National ID":"","Nationality",isVT?"Course Year":"Class","Admission Date","Status"]
                ).filter(Boolean).map(h=><th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map(l=>(
                <tr key={l._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3"><span className="font-mono text-xs font-semibold bg-muted px-1.5 py-0.5 rounded">{l.upi}</span></td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{l.firstName} {l.lastName}{l.otherName?` ${l.otherName}`:""}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{l.gender}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{l.dob}</td>
                  {!isSuperAdmin&&<td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.birthCertNo??"—"}</td>}
                  {!isSuperAdmin&&isVT&&<td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.nationalId??"—"}</td>}
                  <td className="px-4 py-3 text-muted-foreground text-xs">{l.nationality??"—"}</td>
                  {isSuperAdmin&&<td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium uppercase">{l.programType}</span></td>}
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{l.classLevel??"—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{l.admissionDate}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${l.status==="active"?"bg-green-50 text-green-700":"bg-muted text-muted-foreground"}`}>{l.status}</span></td>
                  {isSuperAdmin&&<td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{getInstitutionName(l.institutionId)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
