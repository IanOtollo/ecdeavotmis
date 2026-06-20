import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";
import { Download, FileBarChart, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
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
  toast.success("Exported");
}

export default function MyLearners() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === "super_admin";
  const institutionId = !isSuperAdmin ? user?.institutionId : undefined;

  const institution = useQuery(
    api.institutions.getById,
    institutionId ? { institutionId: institutionId as Id<"institutions"> } : "skip"
  );
  const isVT = institution?.type === "Vocational Training";
  const programType = isVT ? "vocational" : "ecde";

  const [statusFilter, setStatusFilter] = useState<"active"|"inactive"|"all">("active");
  const [genderFilter, setGenderFilter] = useState<"all"|"male"|"female">("all");

  const queryArgs: any = {};
  if (institutionId) queryArgs.institutionId = institutionId;
  if (!isSuperAdmin && institution) queryArgs.programType = programType;
  if (statusFilter !== "all") queryArgs.status = statusFilter;

  const learners = useQuery(api.learners.list, queryArgs);

  const rows = (learners ?? []).filter(l => genderFilter === "all" || l.gender === genderFilter);

  const males   = (learners ?? []).filter(l=>l.gender==="male").length;
  const females = (learners ?? []).filter(l=>l.gender==="female").length;
  const active  = (learners ?? []).filter(l=>l.status==="active").length;

  const exportData = rows.map((l) => ({
    UPI: l.upi,
    "First Name": l.firstName,
    "Last Name": l.lastName,
    "Other Name": l.otherName ?? "",
    Gender: l.gender,
    DOB: l.dob,
    Nationality: l.nationality ?? "",
    "Special Needs": l.hasDisability ? "Yes" : "No",
    Class: l.classLevel ?? "",
    "Admission Date": l.admissionDate,
    Status: l.status,
  }));

  const typeLabel = isSuperAdmin ? "All Learners" : isVT ? "Vocational Training Learners" : "ECDE Learners";

  return (
    <div className="page-container space-y-6">
      <div className="flex items-start justify-between pb-5 border-b border-border flex-wrap gap-3">
        <div>
          <h1 className="section-heading">{typeLabel}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{rows.length} learner(s) shown</p>
        </div>
        <Button onClick={()=>exportCSV(exportData,"my-learners.csv")} variant="outline" className="gap-1.5" disabled={!rows.length}>
          <Download className="h-4 w-4"/> Export CSV
        </Button>
      </div>

      {(learners?.length??0)>0&&(
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[{label:"Total",value:learners?.length??0},{label:"Active",value:active},{label:"Male",value:males},{label:"Female",value:females}]
            .map(({label,value})=><div key={label} className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p><p className="text-xl font-bold mt-1">{value}</p></div>)}
        </div>
      )}

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)} className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gender</label>
          <select value={genderFilter} onChange={e=>setGenderFilter(e.target.value as any)} className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm">
            <option value="all">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      {learners===undefined ? (
        <div className="space-y-2">{[...Array(6)].map((_,i)=><div key={i} className="h-12 bg-muted rounded-xl animate-pulse"/>)}</div>
      ) : rows.length===0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileBarChart className="h-10 w-10 text-muted-foreground/30 mb-3"/>
          <p className="text-muted-foreground text-sm">No learners found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>{["UPI","Name","Gender","DOB","Nationality","Spc. Needs",isVT?"Course Year":"Class","Admission Date","Status",""].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map(l=>(
                <tr key={l._id} onClick={()=>navigate(`/learners/${l._id}`)} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3"><span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{l.upi}</span></td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{l.firstName} {l.lastName}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{l.gender}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{l.dob}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{l.nationality??"—"}</td>
                  <td className="px-4 py-3 text-xs">{l.hasDisability?<span className="text-blue-700 font-medium">Yes</span>:<span className="text-muted-foreground/50">—</span>}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{l.classLevel??"—"}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{l.admissionDate}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${l.status==="active"?"bg-green-50 text-green-700":"bg-muted text-muted-foreground"}`}>{l.status}</span></td>
                  <td className="px-4 py-3"><ChevronRight className="h-4 w-4 text-muted-foreground/40"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
