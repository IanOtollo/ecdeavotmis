import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Id } from "../../convex/_generated/dataModel";

export default function TransferLearners() {
  const { user } = useCurrentUser();
  const [query, setQuery] = useState("");
  const [selectedLearner, setSelectedLearner] = useState<any | null>(null);
  const [toInstitutionId, setToInstitutionId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const results = useQuery(
    api.learners.search,
    query.length >= 2 ? { query, status: "active" } : "skip"
  );
  const allInstitutions = useQuery(api.institutions.list);
  const transfer = useMutation(api.learners.transfer);
  const release = useMutation(api.learners.release);

  async function handleTransfer() {
    if (!selectedLearner || !toInstitutionId) return;
    setLoading(true);
    try {
      await transfer({ learnerId: selectedLearner._id, toInstitutionId: toInstitutionId as Id<"institutions"> });
      toast.success(`${selectedLearner.firstName} ${selectedLearner.lastName} transferred successfully. UPI ${selectedLearner.upi} retained.`);
      setSelectedLearner(null);
      setQuery("");
    } catch (e: any) { toast.error(e.message ?? "Transfer failed"); }
    finally { setLoading(false); }
  }

  async function handleRelease() {
    if (!selectedLearner) return;
    setLoading(true);
    try {
      await release({ learnerId: selectedLearner._id });
      toast.success(`${selectedLearner.firstName} ${selectedLearner.lastName} released`);
      setSelectedLearner(null);
      setQuery("");
    } catch (e: any) { toast.error(e.message ?? "Release failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="section-heading">Transfer / Release Learners</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search for a learner to transfer to another institution or release. The UPI is retained on transfer.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name or UPI…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {query.length >= 2 && results !== undefined && (
        <div className="rounded-xl border border-border overflow-hidden max-w-2xl">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">No active learners found</div>
          ) : (
            results.filter((l) => l.status === "active").map((l) => (
              <button
                key={l._id}
                onClick={() => setSelectedLearner(l)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/50 border-b border-border/50 last:border-0 text-left transition-colors"
              >
                <div>
                  <p className="font-medium">{l.firstName} {l.lastName}</p>
                  <p className="upi-code text-xs text-muted-foreground mt-0.5">{l.upi}</p>
                </div>
                <span className="text-xs text-muted-foreground uppercase">{l.programType}</span>
              </button>
            ))
          )}
        </div>
      )}

      <Dialog open={!!selectedLearner} onOpenChange={(o) => !o && setSelectedLearner(null)}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
              Transfer / Release Learner
            </DialogTitle>
          </DialogHeader>
          {selectedLearner && (
            <div className="space-y-5">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="font-medium">{selectedLearner.firstName} {selectedLearner.lastName}</p>
                <p className="upi-code text-xs text-muted-foreground mt-0.5">{selectedLearner.upi}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Transfer to institution</p>
                <select
                  value={toInstitutionId}
                  onChange={(e) => setToInstitutionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                >
                  <option value="">Select destination institution…</option>
                  {(allInstitutions ?? [])
                    .filter((i) => i._id !== selectedLearner.institutionId)
                    .map((i) => (
                      <option key={i._id} value={i._id}>{i.name}</option>
                    ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  disabled={!toInstitutionId || loading}
                  onClick={handleTransfer}
                  className="flex-1"
                  style={{ backgroundColor: "#C8A96E", color: "#0A0A0A" }}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  {loading ? "Transferring…" : "Transfer"}
                </Button>
                <Button variant="outline" disabled={loading} onClick={handleRelease} className="flex-1">
                  {loading ? "Releasing…" : "Release"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
