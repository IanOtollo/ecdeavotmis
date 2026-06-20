import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";
import { Plus, Pencil, Trash2, Banknote, Star } from "lucide-react";
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
const BANKS = ["Kenya Commercial Bank (KCB)","Cooperative Bank","Equity Bank","National Bank","Absa Bank","NCBA Bank","Family Bank","I&M Bank","DTB Bank","Post Bank","Other"];
const ACCOUNT_TYPES  = ["Operating / General","Capitation / Grants","Salary","Special Project","CDF","Revolving Fund"];
const ACCOUNT_STATUS = ["Active","Dormant","Frozen","Closed"];
const STAFF_ROLES    = ["Head Teacher / Principal","Deputy Principal","Secretary","Bursar","Board Chair","Parent Representative","Other"];

const schema = z.object({
  bankName: z.string().min(1,"Required"), branch: z.string().min(1,"Required"),
  accountName: z.string().min(1,"Required"), accountNo: z.string().min(1,"Required"),
  accountType: z.string().optional(), openingDate: z.string().optional(),
  accountStatus: z.string().optional(), isPrimary: z.boolean().optional(),
  isCapitationAccount: z.boolean().optional(),
  signatory1Name: z.string().optional(), signatory1Role: z.string().optional(), signatory1IdNo: z.string().optional(),
  signatory2Name: z.string().optional(), signatory2Role: z.string().optional(), signatory2IdNo: z.string().optional(),
  bankContactPerson: z.string().optional(), bankContactPhone: z.string().optional(), notes: z.string().optional(),
});
type FD = z.infer<typeof schema>;

function LBL({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{children}</label>;
}

function AccountForm({ defaults, onSubmit, onClose }: { defaults?: Partial<FD>; onSubmit:(d:FD)=>Promise<void>; onClose:()=>void }) {
  const { register, handleSubmit, formState:{errors,isSubmitting} } = useForm<FD>({ resolver:zodResolver(schema), defaultValues:{accountStatus:"Active",...defaults} });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-h-[78vh] overflow-y-auto pr-1">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Bank Details</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1"><LBL>Bank Name *</LBL>
            <select {...register("bankName")} className={S}><option value="">Select bank</option>{BANKS.map(b=><option key={b}>{b}</option>)}</select>
            {errors.bankName && <p className="text-xs text-destructive">{errors.bankName.message}</p>}
          </div>
          <div className="space-y-1"><LBL>Branch *</LBL><Input {...register("branch")} placeholder="e.g. Busia Branch" />{errors.branch && <p className="text-xs text-destructive">{errors.branch.message}</p>}</div>
          <div className="space-y-1"><LBL>Account Type</LBL><select {...register("accountType")} className={S}><option value="">Select</option>{ACCOUNT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="col-span-2 space-y-1"><LBL>Account Name *</LBL><Input {...register("accountName")} placeholder="e.g. Nambale ECDE Centre" />{errors.accountName && <p className="text-xs text-destructive">{errors.accountName.message}</p>}</div>
          <div className="space-y-1"><LBL>Account Number *</LBL><Input {...register("accountNo")} placeholder="e.g. 1234567890" className="font-mono" />{errors.accountNo && <p className="text-xs text-destructive">{errors.accountNo.message}</p>}</div>
          <div className="space-y-1"><LBL>Date Opened</LBL><Input type="date" {...register("openingDate")} /></div>
          <div className="space-y-1"><LBL>Account Status</LBL><select {...register("accountStatus")} className={S}>{ACCOUNT_STATUS.map(s=><option key={s}>{s}</option>)}</select></div>
          <div className="flex items-center gap-4 col-span-2 pt-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" {...register("isPrimary")} className="h-4 w-4" /> Primary Account</label>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" {...register("isCapitationAccount")} className="h-4 w-4" /> Capitation Account</label>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Signatory 1</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1"><LBL>Full Name</LBL><Input {...register("signatory1Name")} placeholder="e.g. John Ochieng" /></div>
          <div className="space-y-1"><LBL>Role</LBL><select {...register("signatory1Role")} className={S}><option value="">Select</option>{STAFF_ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
          <div className="space-y-1"><LBL>National ID No.</LBL><Input {...register("signatory1IdNo")} placeholder="e.g. 12345678" /></div>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Signatory 2</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1"><LBL>Full Name</LBL><Input {...register("signatory2Name")} placeholder="e.g. Mary Wanjiku" /></div>
          <div className="space-y-1"><LBL>Role</LBL><select {...register("signatory2Role")} className={S}><option value="">Select</option>{STAFF_ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
          <div className="space-y-1"><LBL>National ID No.</LBL><Input {...register("signatory2IdNo")} placeholder="e.g. 87654321" /></div>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Bank Contact</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><LBL>Contact Person</LBL><Input {...register("bankContactPerson")} placeholder="e.g. Relationship Manager" /></div>
          <div className="space-y-1"><LBL>Phone</LBL><Input {...register("bankContactPhone")} placeholder="e.g. 0712 345 678" /></div>
          <div className="col-span-2 space-y-1"><LBL>Notes</LBL><Input {...register("notes")} placeholder="Additional notes" /></div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting?"Saving…":"Save Account"}</Button>
      </div>
    </form>
  );
}

export default function BankAccount() {
  const { user } = useCurrentUser();
  const institutionId = user?.role !== "super_admin" ? user?.institutionId : undefined;
  const accounts = useQuery(api.bankAccounts.list, institutionId ? { institutionId } : {});
  const createAccount = useMutation(api.bankAccounts.create);
  const updateAccount = useMutation(api.bankAccounts.update);
  const removeAccount = useMutation(api.bankAccounts.remove);
  const [addOpen,setAddOpen] = useState(false);
  const [editItem,setEditItem] = useState<any|null>(null);
  const [deleteId,setDeleteId] = useState<Id<"bankAccounts">|null>(null);

  async function handleCreate(data:FD) {
    if (!institutionId) return;
    const p:any={...data,institutionId}; Object.keys(p).forEach(k=>{if(p[k]===""||p[k]===undefined)delete p[k];});
    try{await createAccount(p);toast.success("Bank account added");setAddOpen(false);}catch(e:any){toast.error(e.message??"Failed");}
  }
  async function handleUpdate(data:FD) {
    if(!editItem)return;
    const p:any={accountId:editItem._id,...data}; Object.keys(p).forEach(k=>{if(p[k]===""||p[k]===undefined)delete p[k];});
    try{await updateAccount(p);toast.success("Updated");setEditItem(null);}catch(e:any){toast.error(e.message??"Failed");}
  }
  async function handleDelete() {
    if(!deleteId)return;
    try{await removeAccount({accountId:deleteId});toast.success("Removed");}catch(e:any){toast.error(e.message??"Failed");}
    finally{setDeleteId(null);}
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex items-start justify-between pb-5 border-b border-border">
        <div><h1 className="section-heading">Bank Accounts</h1><p className="text-sm text-muted-foreground mt-0.5">{accounts?.length??0} account(s) on record</p></div>
        {institutionId && <Button onClick={()=>setAddOpen(true)} className="gap-1.5"><Plus className="h-4 w-4"/>Add Account</Button>}
      </div>

      {accounts===undefined ? (
        <div className="space-y-3">{[...Array(2)].map((_,i)=><div key={i} className="h-32 bg-muted rounded-xl animate-pulse"/>)}</div>
      ) : accounts.length===0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Banknote className="h-10 w-10 text-muted-foreground/30 mb-3"/>
          <p className="text-muted-foreground text-sm">No bank accounts registered yet</p>
          <Button variant="outline" onClick={()=>setAddOpen(true)} className="mt-3 gap-1.5"><Plus className="h-3.5 w-3.5"/>Add Account</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((acc)=>(
            <div key={acc._id} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 bg-muted/30 border-b border-border flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0"><Banknote className="h-5 w-5 text-muted-foreground"/></div>
                  <div><p className="font-semibold text-foreground">{acc.bankName}</p><p className="text-xs text-muted-foreground">{acc.branch}</p></div>
                  {acc.isPrimary&&<span className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium"><Star className="h-3 w-3"/>Primary</span>}
                  {acc.isCapitationAccount&&<span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">Capitation</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${acc.accountStatus==="Active"?"bg-green-100 text-green-700":"bg-muted text-muted-foreground"}`}>{acc.accountStatus??"Active"}</span>
                  {acc.accountType&&<span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{acc.accountType}</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={()=>setEditItem(acc)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Pencil className="h-3.5 w-3.5 text-muted-foreground"/></button>
                  <button onClick={()=>setDeleteId(acc._id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5 text-red-500"/></button>
                </div>
              </div>
              <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                {[
                  {label:"Account Name",value:acc.accountName},
                  {label:"Account Number",value:acc.accountNo,mono:true},
                  {label:"Date Opened",value:acc.openingDate},
                  {label:"Signatory 1",value:acc.signatory1Name},
                  {label:"S1 Role",value:acc.signatory1Role},
                  {label:"S1 ID No.",value:acc.signatory1IdNo},
                  {label:"Signatory 2",value:acc.signatory2Name},
                  {label:"S2 Role",value:acc.signatory2Role},
                  {label:"S2 ID No.",value:acc.signatory2IdNo},
                  {label:"Bank Contact",value:acc.bankContactPerson},
                  {label:"Contact Phone",value:acc.bankContactPhone},
                  {label:"Notes",value:acc.notes},
                ].filter(f=>f.value).map(({label,value,mono}:{label:string;value:any;mono?:boolean})=>(
                  <div key={label}>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-0.5">{label}</p>
                    <p className={`text-sm font-medium text-foreground ${mono?"font-mono":""}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={o=>!o&&setAddOpen(false)}>
        <DialogContent aria-describedby={undefined} className="max-w-xl"><DialogHeader><DialogTitle>Add Bank Account</DialogTitle></DialogHeader>
          <AccountForm onSubmit={handleCreate} onClose={()=>setAddOpen(false)}/>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editItem} onOpenChange={o=>!o&&setEditItem(null)}>
        <DialogContent aria-describedby={undefined} className="max-w-xl"><DialogHeader><DialogTitle>Edit Bank Account</DialogTitle></DialogHeader>
          {editItem&&<AccountForm defaults={editItem} onSubmit={handleUpdate} onClose={()=>setEditItem(null)}/>}
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={o=>!o&&setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove bank account?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
