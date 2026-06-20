import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";
import { Plus, Pencil, Trash2, Receipt, CheckCircle2, Clock, AlertCircle } from "lucide-react";
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
const TERMS = ["Term 1","Term 2","Term 3"];
const SOURCES = ["National Government (ECDE Capitation)","County Government","CDF","Development Partner / NGO","Internal Revenue","Other"];
const CHANNELS = ["Direct Bank Transfer (EFT)","Cheque","RTGS","Mobile Money (M-Pesa)","Cash","Other"];
const RECON_STATUS = ["Pending Reconciliation","Reconciled","Variance Noted","Disputed"];
const RECON_COLORS: Record<string,string> = {"Reconciled":"bg-green-50 text-green-700","Pending Reconciliation":"bg-yellow-50 text-yellow-700","Variance Noted":"bg-orange-50 text-orange-700","Disputed":"bg-red-50 text-red-700"};

const schema = z.object({
  receiptNo: z.string().min(1,"Required"), amount: z.coerce.number().min(1,"Required"),
  disbursementDate: z.string().min(1,"Required"), depositDate: z.string().optional(),
  term: z.string().min(1,"Required"), financialYear: z.string().min(1,"Required"),
  disbursementSource: z.string().optional(), disbursementChannel: z.string().optional(),
  chequeNo: z.string().optional(), bankRef: z.string().optional(),
  learnersCount: z.coerce.number().optional(), purpose: z.string().optional(),
  reconciliationStatus: z.string().optional(), notes: z.string().optional(),
});
type FD = z.infer<typeof schema>;

function ReceiptForm({ defaults, onSubmit, onClose }: { defaults?:Partial<FD>; onSubmit:(d:FD)=>Promise<void>; onClose:()=>void }) {
  const { register, handleSubmit, formState:{errors,isSubmitting} } = useForm<FD>({ resolver:zodResolver(schema), defaultValues:{reconciliationStatus:"Pending Reconciliation",...defaults} });
  const currentYear = new Date().getFullYear();
  const years = Array.from({length:8},(_,i)=>`${currentYear-i}/${currentYear-i+1}`);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Receipt / Voucher No. *</label>
          <Input {...register("receiptNo")} placeholder="e.g. ECDE/2026/001"/>{errors.receiptNo&&<p className="text-xs text-destructive">{errors.receiptNo.message}</p>}</div>
        <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount (KES) *</label>
          <Input type="number" min={1} {...register("amount")} placeholder="e.g. 120000"/>{errors.amount&&<p className="text-xs text-destructive">{errors.amount.message}</p>}</div>
        <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Term *</label>
          <select {...register("term")} className={S}><option value="">Select</option>{TERMS.map(t=><option key={t}>{t}</option>)}</select>{errors.term&&<p className="text-xs text-destructive">{errors.term.message}</p>}</div>
        <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Financial Year *</label>
          <select {...register("financialYear")} className={S}><option value="">Select</option>{years.map(y=><option key={y}>{y}</option>)}</select>{errors.financialYear&&<p className="text-xs text-destructive">{errors.financialYear.message}</p>}</div>
        <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Disbursement Date *</label>
          <Input type="date" {...register("disbursementDate")}/>{errors.disbursementDate&&<p className="text-xs text-destructive">{errors.disbursementDate.message}</p>}</div>
        <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deposit Date</label><Input type="date" {...register("depositDate")}/></div>
        <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Disbursement Source</label>
          <select {...register("disbursementSource")} className={S}><option value="">Select</option>{SOURCES.map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Channel</label>
          <select {...register("disbursementChannel")} className={S}><option value="">Select</option>{CHANNELS.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cheque / EFT No.</label><Input {...register("chequeNo")} placeholder="If applicable"/></div>
        <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bank Reference No.</label><Input {...register("bankRef")} placeholder="e.g. TXN123456789"/></div>
        <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">No. of Learners Covered</label><Input type="number" min={0} {...register("learnersCount")} placeholder="e.g. 45"/></div>
        <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reconciliation Status</label>
          <select {...register("reconciliationStatus")} className={S}>{RECON_STATUS.map(r=><option key={r}>{r}</option>)}</select></div>
        <div className="col-span-2 space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Purpose / Description</label><Input {...register("purpose")} placeholder="e.g. ECDE capitation Term 1 2026"/></div>
        <div className="col-span-2 space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</label><Input {...register("notes")} placeholder="Additional remarks"/></div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting?"Saving…":"Save Receipt"}</Button>
      </div>
    </form>
  );
}

export default function CapitationReceipts() {
  const { user } = useCurrentUser();
  const institutionId = user?.role !== "super_admin" ? user?.institutionId : undefined;
  const receipts = useQuery(api.capitationReceipts.list, institutionId ? { institutionId } : {});
  const createReceipt = useMutation(api.capitationReceipts.create);
  const updateReceipt = useMutation(api.capitationReceipts.update);
  const removeReceipt = useMutation(api.capitationReceipts.remove);
  const [addOpen,setAddOpen] = useState(false);
  const [editItem,setEditItem] = useState<any|null>(null);
  const [deleteId,setDeleteId] = useState<Id<"capitationReceipts">|null>(null);

  async function handleCreate(data:FD) {
    if(!institutionId)return;
    const p:any={...data,institutionId}; Object.keys(p).forEach(k=>{if(p[k]===""||p[k]===undefined)delete p[k];});
    try{await createReceipt(p);toast.success("Receipt recorded");setAddOpen(false);}catch(e:any){toast.error(e.message??"Failed");}
  }
  async function handleUpdate(data:FD) {
    if(!editItem)return;
    const p:any={receiptId:editItem._id,...data}; Object.keys(p).forEach(k=>{if(p[k]===""||p[k]===undefined)delete p[k];});
    try{await updateReceipt(p);toast.success("Updated");setEditItem(null);}catch(e:any){toast.error(e.message??"Failed");}
  }
  async function handleDelete() {
    if(!deleteId)return;
    try{await removeReceipt({receiptId:deleteId});toast.success("Removed");}catch(e:any){toast.error(e.message??"Failed");}
    finally{setDeleteId(null);}
  }

  const totalAmount=(receipts??[]).reduce((s,r)=>s+r.amount,0);
  const reconciled=(receipts??[]).filter(r=>r.reconciliationStatus==="Reconciled").length;

  return (
    <div className="page-container space-y-6">
      <div className="flex items-start justify-between pb-5 border-b border-border">
        <div><h1 className="section-heading">Capitation Receipts</h1><p className="text-sm text-muted-foreground mt-0.5">Government grants and disbursements register</p></div>
        {institutionId&&<Button onClick={()=>setAddOpen(true)} className="gap-1.5"><Plus className="h-4 w-4"/>Add Receipt</Button>}
      </div>
      {(receipts?.length??0)>0&&(
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[{label:"Total Receipts",value:receipts?.length??0},{label:"Total Disbursed",value:`KES ${totalAmount.toLocaleString()}`},{label:"Reconciled",value:`${reconciled} / ${receipts?.length??0}`}]
            .map(({label,value})=><div key={label} className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p><p className="text-xl font-bold mt-1">{value}</p></div>)}
        </div>
      )}
      {receipts===undefined ? (
        <div className="space-y-2">{[...Array(3)].map((_,i)=><div key={i} className="h-16 bg-muted rounded-xl animate-pulse"/>)}</div>
      ) : receipts.length===0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Receipt className="h-10 w-10 text-muted-foreground/30 mb-3"/>
          <p className="text-muted-foreground text-sm">No capitation receipts on record</p>
          <Button variant="outline" onClick={()=>setAddOpen(true)} className="mt-3 gap-1.5"><Plus className="h-3.5 w-3.5"/>Add First Receipt</Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>{["Receipt No.","Amount (KES)","Term / Year","Disburse Date","Deposit Date","Source","Learners","Status",""].map(h=>(
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}</tr></thead>
            <tbody className="divide-y divide-border/60">
              {receipts.map(r=>(
                <tr key={r._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-xs">{r.receiptNo}</td>
                  <td className="px-4 py-3 font-semibold">KES {r.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">{r.term} · {r.financialYear}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{r.disbursementDate}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{r.depositDate??"—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-[140px] truncate">{r.disbursementSource??"—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.learnersCount??"—"}</td>
                  <td className="px-4 py-3">
                    {r.reconciliationStatus&&<span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${RECON_COLORS[r.reconciliationStatus]??""}`}>
                      {r.reconciliationStatus==="Reconciled"?<CheckCircle2 className="h-3 w-3"/>:r.reconciliationStatus==="Pending Reconciliation"?<Clock className="h-3 w-3"/>:<AlertCircle className="h-3 w-3"/>}
                      {r.reconciliationStatus}</span>}
                  </td>
                  <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1">
                    <button onClick={()=>setEditItem(r)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Pencil className="h-3.5 w-3.5 text-muted-foreground"/></button>
                    <button onClick={()=>setDeleteId(r._id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5 text-red-500"/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={addOpen} onOpenChange={o=>!o&&setAddOpen(false)}>
        <DialogContent aria-describedby={undefined} className="max-w-xl"><DialogHeader><DialogTitle>Record Capitation Receipt</DialogTitle></DialogHeader>
          <ReceiptForm onSubmit={handleCreate} onClose={()=>setAddOpen(false)}/></DialogContent>
      </Dialog>
      <Dialog open={!!editItem} onOpenChange={o=>!o&&setEditItem(null)}>
        <DialogContent aria-describedby={undefined} className="max-w-xl"><DialogHeader><DialogTitle>Edit Receipt</DialogTitle></DialogHeader>
          {editItem&&<ReceiptForm defaults={editItem} onSubmit={handleUpdate} onClose={()=>setEditItem(null)}/>}</DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={o=>!o&&setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove this receipt?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
