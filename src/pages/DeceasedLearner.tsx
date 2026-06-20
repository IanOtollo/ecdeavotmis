import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Search, Skull } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DeceasedLearner() {
  const [query, setQuery] = useState("");
  const [selectedLearner, setSelectedLearner] = useState<any | null>(null);
  const [dateOfDeath, setDateOfDeath] = useState("");
  const [causeOfDeath, setCauseOfDeath] = useState("");
  const [deathDetails, setDeathDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const results = useQuery(
    api.learners.search,
    query.length >= 2 ? { query } : "skip"
  );
  const deceasedList = useQuery(api.learners.list, { status: "deceased" });
  const markDeceased = useMutation(api.learners.markDeceased);

  async function handleSubmit() {
    if (!selectedLearner || !dateOfDeath || !causeOfDeath) {
      toast.error("Date of death and cause are required");
      return;
    }
    setLoading(true);
    try {
      await markDeceased({ learnerId: selectedLearner._id, dateOfDeath, causeOfDeath, deathDetails: deathDetails || undefined });
      toast.success(`${selectedLearner.firstName} ${selectedLearner.lastName} marked as deceased`);
      setSelectedLearner(null);
      setQuery("");
      setDateOfDeath(""); setCauseOfDeath(""); setDeathDetails("");
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="section-heading">Deceased Learners</h1>
        <p className="text-sm text-muted-foreground mt-1">Record and view deceased learner records</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search learner by name or UPI…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {query.length >= 2 && results !== undefined && results.filter((l) => l.status === "active").length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden max-w-2xl">
          {results.filter((l) => l.status === "active").map((l) => (
            <button key={l._id} onClick={() => setSelectedLearner(l)} className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/50 border-b border-border/50 last:border-0 text-left transition-colors">
              <div>
                <p className="font-medium">{l.firstName} {l.lastName}</p>
                <p className="upi-code text-xs text-muted-foreground mt-0.5">{l.upi}</p>
              </div>
              <span className="text-xs text-muted-foreground capitalize">{l.programType}</span>
            </button>
          ))}
        </div>
      )}

      {/* Deceased records */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">Deceased Records</h2>
        {deceasedList === undefined ? (
          <div className="h-12 bg-muted rounded-xl animate-pulse" />
        ) : deceasedList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Skull className="h-8 w-8 text-muted-foreground/20 mb-2" />
            <p className="text-muted-foreground text-sm">No deceased records</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {["UPI", "Name", "Date of Death", "Cause"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {deceasedList.map((l) => (
                  <tr key={l._id} className="data-table-row">
                    <td className="px-4 py-3"><span className="upi-code text-xs">{l.upi}</span></td>
                    <td className="px-4 py-3 font-medium">{l.firstName} {l.lastName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.dateOfDeath ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.causeOfDeath ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={!!selectedLearner} onOpenChange={(o) => !o && setSelectedLearner(null)}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>Record Deceased Learner</DialogTitle>
          </DialogHeader>
          {selectedLearner && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="font-medium">{selectedLearner.firstName} {selectedLearner.lastName}</p>
                <p className="upi-code text-xs text-muted-foreground mt-0.5">{selectedLearner.upi}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date of Death *</label>
                <Input type="date" value={dateOfDeath} onChange={(e) => setDateOfDeath(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cause of Death *</label>
                <Input value={causeOfDeath} onChange={(e) => setCauseOfDeath(e.target.value)} placeholder="e.g. Malaria" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Additional Details</label>
                <textarea value={deathDetails} onChange={(e) => setDeathDetails(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Optional additional information" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedLearner(null)}>Cancel</Button>
                <Button disabled={loading || !dateOfDeath || !causeOfDeath} onClick={handleSubmit} className="bg-destructive hover:bg-destructive/90 text-white">
                  {loading ? "Saving…" : "Confirm Deceased"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
