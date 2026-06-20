import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";
import { GraduationCap, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  transferred: "bg-blue-100 text-blue-700 border-blue-200",
  released: "bg-gray-100 text-gray-700 border-gray-200",
  deceased: "bg-red-100 text-red-700 border-red-200",
};

export default function ViewLearners() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [programType, setProgramType] = useState<"all" | "ecde" | "vocational">("all");
  const [status, setStatus] = useState<"all" | "active" | "transferred" | "released" | "deceased">("active");

  const learners = useQuery(api.learners.list, {
    programType: programType === "all" ? undefined : programType,
    status: status === "all" ? undefined : status,
  });

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="section-heading">View Learners</h1>
        <p className="text-sm text-muted-foreground mt-1">{learners?.length ?? 0} learner(s)</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-2">Program</label>
          <select value={programType} onChange={(e) => setProgramType(e.target.value as any)} className="px-3 py-1.5 rounded-md border border-border bg-background text-sm">
            <option value="all">All</option>
            <option value="ecde">ECDE</option>
            <option value="vocational">Vocational</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-2">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="px-3 py-1.5 rounded-md border border-border bg-background text-sm">
            <option value="active">Active</option>
            <option value="all">All</option>
            <option value="transferred">Transferred</option>
            <option value="released">Released</option>
            <option value="deceased">Deceased</option>
          </select>
        </div>
      </div>

      {learners === undefined ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : learners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <GraduationCap className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">No learners found matching the selected filters</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["UPI", "Name", "Class / Year", "Gender", "Program", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {learners.map((l) => (
                <tr
                  key={l._id}
                  className="data-table-row cursor-pointer"
                  onClick={() => navigate(`/learners/${l._id}`)}
                >
                  <td className="px-4 py-3"><span className="font-mono text-xs">{l.upi}</span></td>
                  <td className="px-4 py-3 font-medium">{l.firstName} {l.lastName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.classLevel ?? "—"}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{l.gender}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium uppercase">{l.programType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[l.status] ?? ""}`}>{l.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 inline" />
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
