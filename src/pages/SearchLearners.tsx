import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SearchLearners() {
  const [query, setQuery] = useState("");
  const [programType, setProgramType] = useState<"all" | "ecde" | "vocational">("all");
  const debouncedQuery = query.length >= 2 ? query : "";

  const results = useQuery(
    api.learners.search,
    debouncedQuery ? { query: debouncedQuery, programType: programType === "all" ? undefined : programType } : "skip"
  );

  return (
    <div className="page-container space-y-6">
      <h1 className="section-heading">Search Learners</h1>

      <div className="flex gap-3 flex-wrap max-w-2xl">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name or UPI…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select value={programType} onChange={(e) => setProgramType(e.target.value as any)} className="px-3 py-2 rounded-md border border-border bg-background text-sm">
          <option value="all">All Programs</option>
          <option value="ecde">ECDE</option>
          <option value="vocational">Vocational</option>
        </select>
      </div>

      {!debouncedQuery ? (
        <div className="text-center py-20">
          <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Enter at least 2 characters to search</p>
        </div>
      ) : results === undefined ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : results.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-sm">No learners found for "{query}"</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["UPI", "Name", "Gender", "DOB", "Program", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {results.map((l) => (
                <tr key={l._id} className="data-table-row">
                  <td className="px-4 py-3"><span className="upi-code text-xs">{l.upi}</span></td>
                  <td className="px-4 py-3 font-medium">{l.firstName} {l.lastName}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{l.gender}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.dob}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium uppercase">{l.programType}</span></td>
                  <td className="px-4 py-3"><span className="text-xs font-medium">{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">{results.length} result(s)</p>
          </div>
        </div>
      )}
    </div>
  );
}
