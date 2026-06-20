import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";
import { Plus, Pencil, Trash2, Database, Zap, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Id } from "../../convex/_generated/dataModel";

const S = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30";

const CATEGORIES = ["Classrooms","Administration Block","Library","Laboratory","ICT Room","Kitchen / Dining","Sanitation (Toilets)","Water Points","Playground / Sports","Storage","Staff Room","Special Needs Room","Other"];
const CONDITIONS  = ["Excellent","Good","Fair","Poor","Needs Urgent Repair","Condemned"];
const OWNERSHIP   = ["Government","County Government","Community","Donated","Leased","Self-Help Group"];

const schema = z.object({
  category: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  quantity: z.coerce.number().min(1, "Min 1"),
  condition: z.string().min(1, "Required"),
  ownershipType: z.string().optional(),
  dateConstructed: z.string().optional(),
  lastMaintained: z.string().optional(),
  estimatedCost: z.coerce.number().optional(),
  conditionNotes: z.string().optional(),
  hasElectricity: z.boolean().optional(),
  hasWater: z.boolean().optional(),
});
type FD = z.infer<typeof schema>;

const CONDITION_COLORS: Record<string, string> = {
  Excellent: "bg-green-100 text-green-800",
  Good: "bg-green-50 text-green-700",
  Fair: "bg-yellow-100 text-yellow-800",
  Poor: "bg-orange-100 text-orange-800",
  "Needs Urgent Repair": "bg-red-100 text-red-800",
  Condemned: "bg-red-200 text-red-900",
};

function InfraForm({ defaults, onSubmit, onClose }: { defaults?: Partial<FD>; onSubmit: (d: FD) => Promise<void>; onClose: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FD>({ resolver: zodResolver(schema), defaultValues: defaults });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category *</label>
          <select {...register("category")} className={S}>
            <option value="">Select</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description *</label>
          <Input {...register("description")} placeholder="e.g. Permanent iron-sheet classrooms, VIP latrines" />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity *</label>
          <Input type="number" min={1} {...register("quantity")} />
          {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Condition *</label>
          <select {...register("condition")} className={S}>
            <option value="">Select</option>
            {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
          {errors.condition && <p className="text-xs text-destructive">{errors.condition.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ownership</label>
          <select {...register("ownershipType")} className={S}>
            <option value="">Select</option>
            {OWNERSHIP.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estimated Cost (KES)</label>
          <Input type="number" min={0} {...register("estimatedCost")} placeholder="e.g. 250000" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Constructed</label>
          <Input type="date" {...register("dateConstructed")} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Maintained</label>
          <Input type="date" {...register("lastMaintained")} />
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Condition Notes / Repair Details</label>
          <Input {...register("conditionNotes")} placeholder="e.g. Roof leaking on north end, requires patching" />
        </div>
        <div className="flex items-center gap-6 col-span-2 pt-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register("hasElectricity")} className="h-4 w-4 rounded border-border" />
            Has Electricity
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register("hasWater")} className="h-4 w-4 rounded border-border" />
            Has Running Water
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save Record"}</Button>
      </div>
    </form>
  );
}

export default function Infrastructure() {
  const { user } = useCurrentUser();
  const institutionId = user?.role !== "super_admin" ? user?.institutionId : undefined;
  const items = useQuery(api.infrastructure.list, institutionId ? { institutionId } : {});
  const createItem = useMutation(api.infrastructure.create);
  const updateItem = useMutation(api.infrastructure.update);
  const removeItem = useMutation(api.infrastructure.remove);

  const [addOpen, setAddOpen]   = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<Id<"infrastructure"> | null>(null);

  if (!institutionId && user?.role !== "super_admin") {
    return <div className="page-container"><p className="text-muted-foreground text-sm">No institution assigned.</p></div>;
  }

  async function handleCreate(data: FD) {
    if (!institutionId) return;
    const payload: any = { ...data, institutionId };
    Object.keys(payload).forEach((k) => { if (payload[k] === "" || payload[k] === undefined) delete payload[k]; });
    try { await createItem(payload); toast.success("Record added"); setAddOpen(false); }
    catch (e: any) { toast.error(e.message ?? "Failed"); }
  }

  async function handleUpdate(data: FD) {
    if (!editItem) return;
    const payload: any = { infraId: editItem._id, ...data };
    Object.keys(payload).forEach((k) => { if (payload[k] === "" || payload[k] === undefined) delete payload[k]; });
    try { await updateItem(payload); toast.success("Updated"); setEditItem(null); }
    catch (e: any) { toast.error(e.message ?? "Failed"); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await removeItem({ infraId: deleteId }); toast.success("Removed"); }
    catch (e: any) { toast.error(e.message ?? "Failed"); }
    finally { setDeleteId(null); }
  }

  const totalValue = (items ?? []).reduce((s, i) => s + (i.estimatedCost ?? 0), 0);
  const needsRepair = (items ?? []).filter((i) => i.condition === "Poor" || i.condition === "Needs Urgent Repair" || i.condition === "Condemned").length;

  return (
    <div className="page-container space-y-6">
      <div className="flex items-start justify-between pb-5 border-b border-border">
        <div>
          <h1 className="section-heading">Infrastructure</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Physical assets and facilities inventory</p>
        </div>
        {institutionId && (
          <Button onClick={() => setAddOpen(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Add Asset</Button>
        )}
      </div>

      {/* Summary cards */}
      {(items?.length ?? 0) > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Assets", value: items?.length ?? 0, color: "" },
            { label: "Need Repair", value: needsRepair, color: needsRepair > 0 ? "text-red-600" : "" },
            { label: "Est. Total Value", value: totalValue > 0 ? `KES ${totalValue.toLocaleString()}` : "—", color: "" },
            { label: "Categories", value: new Set(items?.map((i) => i.category)).size, color: "" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
              <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {items === undefined ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Database className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">No infrastructure records yet</p>
          <Button variant="outline" onClick={() => setAddOpen(true)} className="mt-3 gap-1.5"><Plus className="h-3.5 w-3.5" /> Add First Asset</Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Category","Description","Qty","Condition","Ownership","Est. Cost (KES)","Utilities",""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{item.category}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs">
                    <p>{item.description}</p>
                    {item.conditionNotes && <p className="text-xs text-muted-foreground/70 mt-0.5 italic">{item.conditionNotes}</p>}
                  </td>
                  <td className="px-4 py-3 font-medium">{item.quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CONDITION_COLORS[item.condition] ?? "bg-muted text-muted-foreground"}`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{item.ownershipType ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {item.estimatedCost ? `KES ${item.estimatedCost.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {item.hasElectricity && <span title="Electricity"><Zap className="h-3.5 w-3.5 text-yellow-500" /></span>}
                      {item.hasWater && <span title="Water"><Droplets className="h-3.5 w-3.5 text-blue-500" /></span>}
                      {!item.hasElectricity && !item.hasWater && <span className="text-xs text-muted-foreground/50">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setEditItem(item)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                      <button onClick={() => setDeleteId(item._id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={(o) => !o && setAddOpen(false)}>
        <DialogContent aria-describedby={undefined} className="max-w-lg">
          <DialogHeader><DialogTitle>Add Infrastructure Record</DialogTitle></DialogHeader>
          <InfraForm onSubmit={handleCreate} onClose={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent aria-describedby={undefined} className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Infrastructure Record</DialogTitle></DialogHeader>
          {editItem && <InfraForm defaults={editItem} onSubmit={handleUpdate} onClose={() => setEditItem(null)} />}
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this record?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
