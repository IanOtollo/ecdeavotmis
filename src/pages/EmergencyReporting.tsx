import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
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

const INCIDENT_TYPES = ["Fire","Flood / Flash Flood","Learner Injury","Learner Illness / Outbreak","Child Abuse / Neglect","Theft / Burglary","Vandalism","Structural Collapse / Damage","Food Poisoning","Natural Disaster","Security Threat","Teacher / Staff Incident","Other"];
const SEVERITY_LEVELS = ["Low (Minor — no injuries, contained)","Medium (Moderate — some impact, managed)","High (Serious — injuries or significant damage)","Critical (Life-threatening or mass casualty)"];
const STATUS_OPTIONS = ["open","in_progress","resolved"] as const;

const schema = z.object({
  incidentType: z.string().min(1,"Required"),
  incidentDate: z.string().min(1,"Required"),
  incidentTime: z.string().optional(),
  severity: z.string().optional(),
  locationWithin: z.string().optional(),
  description: z.string().min(1,"Required"),
  affectedCount: z.coerce.number().optional(),
  injuries: z.string().optional(),
  policeRef: z.string().optional(),
  financialImpact: z.coerce.number().optional(),
  response: z.string().optional(),
  correctiveMeasures: z.string().optional(),
  resolvedDate: z.string().optional(),
  parentNotified: z.boolean().optional(),
  insuranceClaim: z.boolean().optional(),
  status: z.enum(STATUS_OPTIONS).optional(),
});
type FD = z.infer<typeof schema>;

const SEV_COLORS: Record<string,string> = {
  "Low (Minor — no injuries, contained)": "bg-green-50 text-green-700",
  "Medium (Moderate — some impact, managed)": "bg-yellow-50 text-yellow-700",
  "High (Serious — injuries or significant damage)": "bg-orange-50 text-orange-700",
  "Critical (Life-threatening or mass casualty)": "bg-red-100 text-red-800",
};
const STATUS_COLORS: Record<string,string> = {open:"bg-red-50 text-red-700",in_progress:"bg-yellow-50 text-yellow-700",resolved:"bg-green-50 text-green-700"};
const STATUS_ICONS: Record<string,React.ReactNode> = {open:<AlertTriangle className="h-3 w-3"/>,in_progress:<Clock className="h-3 w-3"/>,resolved:<CheckCircle2 className="h-3 w-3"/>};

function EmergencyForm({ defaults, onSubmit, onClose, isEdit }: { defaults?:Partial<FD>; onSubmit:(d:FD)=>Promise<void>; onClose:()=>void; isEdit?:boolean }) {
  const { register, handleSubmit, formState:{errors,isSubmitting} } = useForm<FD>({ resolver:zodResolver(schema), defaultValues:{status:"open",...defaults} });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-h-[78vh] overflow-y-auto pr-1">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Incident Details</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Incident Type *</label>
            <select {...register("incidentType")} className={S}><option value="">Select type</option>{INCIDENT_TYPES.map(t=><option key={t}>{t}</option>)}</select>
            {errors.incidentType&&<p className="text-xs text-destructive">{errors.incidentType.message}</p>}</div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date *</label>
            <Input type="date" {...register("incidentDate")}/>{errors.incidentDate&&<p className="text-xs text-destructive">{errors.incidentDate.message}</p>}</div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time (Approx)</label>
            <Input type="time" {...register("incidentTime")}/></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Severity Level</label>
            <select {...register("severity")} className={S}><option value="">Select</option>{SEVERITY_LEVELS.map(s=><option key={s}>{s}</option>)}</select></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location Within Premises</label>
            <Input {...register("locationWithin")} placeholder="e.g. Classroom Block A, Kitchen"/></div>
          <div className="col-span-2 space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description *</label>
            <textarea {...register("description")} className={`${S} resize-none`} rows={3} placeholder="Describe what happened, how it started, what was affected…"/>
            {errors.description&&<p className="text-xs text-destructive">{errors.description.message}</p>}</div>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Impact Assessment</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">No. of People Affected</label>
            <Input type="number" min={0} {...register("affectedCount")} placeholder="e.g. 12"/></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Financial Impact (KES)</label>
            <Input type="number" min={0} {...register("financialImpact")} placeholder="e.g. 50000"/></div>
          <div className="col-span-2 space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Injuries / Medical Notes</label>
            <Input {...register("injuries")} placeholder="e.g. 2 learners sustained minor cuts, taken to Busia Hospital"/></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Police Reference No.</label>
            <Input {...register("policeRef")} placeholder="e.g. OB/12/2026"/></div>
          <div className="flex items-center gap-6 pt-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" {...register("parentNotified")} className="h-4 w-4"/>Parents Notified</label>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" {...register("insuranceClaim")} className="h-4 w-4"/>Insurance Claim Filed</label>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Response & Resolution</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Immediate Response Taken</label>
            <textarea {...register("response")} className={`${S} resize-none`} rows={2} placeholder="e.g. Fire extinguished, emergency services called, learners evacuated…"/></div>
          <div className="col-span-2 space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Corrective Measures</label>
            <textarea {...register("correctiveMeasures")} className={`${S} resize-none`} rows={2} placeholder="e.g. Fire extinguishers installed, electrical wiring inspected and replaced…"/></div>
          {isEdit&&<>
            <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
              <select {...register("status")} className={S}>{STATUS_OPTIONS.map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}</select></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resolved Date</label><Input type="date" {...register("resolvedDate")}/></div>
          </>}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting?"Saving…":"Save Report"}</Button>
      </div>
    </form>
  );
}

export default function EmergencyReporting() {
  const { user } = useCurrentUser();
  const institutionId = user?.role !== "super_admin" ? user?.institutionId : undefined;
  const incidents = useQuery(api.emergencies.list, institutionId ? { institutionId } : {});
  const createInc = useMutation(api.emergencies.create);
  const updateInc = useMutation(api.emergencies.update);
  const removeInc = useMutation(api.emergencies.remove);
  const [addOpen,setAddOpen] = useState(false);
  const [editItem,setEditItem] = useState<any|null>(null);
  const [deleteId,setDeleteId] = useState<Id<"emergencies">|null>(null);

  async function handleCreate(data:FD) {
    if(!institutionId)return;
    const p:any={...data,institutionId}; Object.keys(p).forEach(k=>{if(p[k]===""||p[k]===undefined)delete p[k];});
    try{await createInc(p);toast.success("Incident reported");setAddOpen(false);}catch(e:any){toast.error(e.message??"Failed");}
  }
  async function handleUpdate(data:FD) {
    if(!editItem)return;
    const p:any={emergencyId:editItem._id,...data}; Object.keys(p).forEach(k=>{if(p[k]===""||p[k]===undefined)delete p[k];});
    try{await updateInc(p);toast.success("Updated");setEditItem(null);}catch(e:any){toast.error(e.message??"Failed");}
  }
  async function handleDelete() {
    if(!deleteId)return;
    try{await removeInc({emergencyId:deleteId});toast.success("Removed");}catch(e:any){toast.error(e.message??"Failed");}
    finally{setDeleteId(null);}
  }

  const openCount=(incidents??[]).filter(i=>i.status==="open").length;
  const inProgress=(incidents??[]).filter(i=>i.status==="in_progress").length;
  const resolvedCount=(incidents??[]).filter(i=>i.status==="resolved").length;

  return (
    <div className="page-container space-y-6">
      <div className="flex items-start justify-between pb-5 border-b border-border">
        <div><h1 className="section-heading">Emergency Reporting</h1><p className="text-sm text-muted-foreground mt-0.5">Incident log and emergency response tracker</p></div>
        {institutionId&&<Button onClick={()=>setAddOpen(true)} className="gap-1.5 bg-red-600 hover:bg-red-700 text-white"><Plus className="h-4 w-4"/>Report Incident</Button>}
      </div>

      {(incidents?.length??0)>0&&(
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[{label:"Total Incidents",value:incidents?.length??0,cls:""},{label:"Open",value:openCount,cls:openCount>0?"text-red-600":""},{label:"In Progress",value:inProgress,cls:inProgress>0?"text-yellow-600":""},{label:"Resolved",value:resolvedCount,cls:"text-green-600"}]
            .map(({label,value,cls})=><div key={label} className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p><p className={`text-xl font-bold mt-1 ${cls}`}>{value}</p></div>)}
        </div>
      )}

      {incidents===undefined ? (
        <div className="space-y-2">{[...Array(3)].map((_,i)=><div key={i} className="h-20 bg-muted rounded-xl animate-pulse"/>)}</div>
      ) : incidents.length===0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShieldAlert className="h-10 w-10 text-muted-foreground/30 mb-3"/>
          <p className="text-muted-foreground text-sm">No incidents on record</p>
          <Button variant="outline" onClick={()=>setAddOpen(true)} className="mt-3 gap-1.5"><Plus className="h-3.5 w-3.5"/>Report First Incident</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map(inc=>(
            <div key={inc._id} className={`rounded-xl border bg-card overflow-hidden ${inc.status==="open"?"border-red-200":inc.status==="in_progress"?"border-yellow-200":"border-border"}`}>
              <div className="px-5 py-4 flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${inc.status==="open"?"bg-red-100":inc.status==="in_progress"?"bg-yellow-100":"bg-green-100"}`}>
                    <AlertTriangle className={`h-4 w-4 ${inc.status==="open"?"text-red-600":inc.status==="in_progress"?"text-yellow-600":"text-green-600"}`}/>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground">{inc.incidentType}</p>
                      {inc.severity&&<span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SEV_COLORS[inc.severity]??""}`}>{inc.severity.split(" ")[0]}</span>}
                      <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[inc.status]}`}>
                        {STATUS_ICONS[inc.status]}{inc.status.replace("_"," ")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{inc.incidentDate}{inc.incidentTime?` at ${inc.incidentTime}`:""}{inc.locationWithin?` · ${inc.locationWithin}`:""}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={()=>setEditItem(inc)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Pencil className="h-3.5 w-3.5 text-muted-foreground"/></button>
                  <button onClick={()=>setDeleteId(inc._id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5 text-red-500"/></button>
                </div>
              </div>
              <div className="px-5 pb-4 space-y-2">
                <p className="text-sm text-muted-foreground leading-relaxed">{inc.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-xs mt-2">
                  {inc.affectedCount!=null&&<span className="text-muted-foreground"><span className="font-semibold text-foreground">{inc.affectedCount}</span> affected</span>}
                  {inc.injuries&&<span className="text-muted-foreground">Injuries: <span className="text-foreground">{inc.injuries}</span></span>}
                  {inc.policeRef&&<span className="text-muted-foreground">Police ref: <span className="font-mono text-foreground">{inc.policeRef}</span></span>}
                  {inc.financialImpact!=null&&<span className="text-muted-foreground">Financial impact: <span className="font-semibold text-foreground">KES {inc.financialImpact.toLocaleString()}</span></span>}
                  {inc.parentNotified&&<span className="text-green-700 font-medium">Parents notified</span>}
                  {inc.insuranceClaim&&<span className="text-blue-700 font-medium">Insurance claim filed</span>}
                </div>
                {inc.response&&<p className="text-xs text-muted-foreground pt-1 border-t border-border/50"><span className="font-semibold text-foreground">Response: </span>{inc.response}</p>}
                {inc.correctiveMeasures&&<p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Corrective measures: </span>{inc.correctiveMeasures}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={o=>!o&&setAddOpen(false)}>
        <DialogContent aria-describedby={undefined} className="max-w-xl"><DialogHeader><DialogTitle>Report Incident / Emergency</DialogTitle></DialogHeader>
          <EmergencyForm onSubmit={handleCreate} onClose={()=>setAddOpen(false)}/></DialogContent>
      </Dialog>
      <Dialog open={!!editItem} onOpenChange={o=>!o&&setEditItem(null)}>
        <DialogContent aria-describedby={undefined} className="max-w-xl"><DialogHeader><DialogTitle>Update Incident Report</DialogTitle></DialogHeader>
          {editItem&&<EmergencyForm isEdit defaults={editItem} onSubmit={handleUpdate} onClose={()=>setEditItem(null)}/>}</DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={o=>!o&&setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove incident report?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
