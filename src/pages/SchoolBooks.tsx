import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
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
const CATEGORIES = ["Textbook","Reference Book","Storybook / Library","Workbook / Activity","Teacher's Guide","Assessment / Exam Paper","Curriculum Material","Braille / Special Needs","Other"];
const CONDITIONS  = ["New","Good","Fair","Poor","Condemned"];
const FUNDING     = ["Government (National)","County Government","CDF","Parent / Community Contribution","Donation / NGO","Purchase (School Funds)","Other"];
const CURRICULUM  = ["CBC (Competency-Based Curriculum)","KCPE / Kenya Curriculum","TVET / Vocational","Other"];
const LANGUAGES   = ["English","Kiswahili","Bilingual (English & Kiswahili)","Local Language","Other"];
const ECDE_GRADES = ["PP1","PP2","Grade 1","Grade 2","Grade 3","All Levels","Other"];
const VT_GRADES   = ["Level 1","Level 2","Level 3","All Levels","Other"];

const schema = z.object({
  title: z.string().min(1,"Required"),
  author: z.string().optional(), publisher: z.string().optional(), isbn: z.string().optional(),
  subject: z.string().optional(), gradeLevel: z.string().optional(), language: z.string().optional(),
  bookCategory: z.string().optional(), curriculumAlignment: z.string().optional(),
  yearPublished: z.coerce.number().optional(),
  quantity: z.coerce.number().min(0,"Required"),
  inCirculation: z.coerce.number().optional(),
  bookCondition: z.string().optional(), costPerUnit: z.coerce.number().optional(),
  supplier: z.string().optional(), acquisitionDate: z.string().optional(),
  fundingSource: z.string().optional(), storageLocation: z.string().optional(),
});
type FD = z.infer<typeof schema>;

const COND_COLORS: Record<string,string> = {"New":"bg-green-100 text-green-700","Good":"bg-green-50 text-green-600","Fair":"bg-yellow-50 text-yellow-700","Poor":"bg-orange-50 text-orange-700","Condemned":"bg-red-100 text-red-700"};

function BookForm({ defaults, isVT, onSubmit, onClose }: { defaults?:Partial<FD>; isVT?:boolean; onSubmit:(d:FD)=>Promise<void>; onClose:()=>void }) {
  const { register, handleSubmit, formState:{errors,isSubmitting} } = useForm<FD>({ resolver:zodResolver(schema), defaultValues:{bookCondition:"Good",language:"English",...defaults} });
  const gradeLevels = isVT ? VT_GRADES : ECDE_GRADES;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Book Information</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
            <Input {...register("title")} placeholder="e.g. Spotlight Science Grade 3"/>{errors.title&&<p className="text-xs text-destructive">{errors.title.message}</p>}</div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Author</label><Input {...register("author")} placeholder="e.g. Jane Muthoni"/></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Publisher</label><Input {...register("publisher")} placeholder="e.g. Longhorn Publishers"/></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ISBN</label><Input {...register("isbn")} placeholder="e.g. 978-9966-XX-XXX-X"/></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Year Published</label>
            <Input type="number" min={1980} max={2030} {...register("yearPublished")} placeholder="e.g. 2023"/></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</label><Input {...register("subject")} placeholder="e.g. Mathematics, Science"/></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grade / Level</label>
            <select {...register("gradeLevel")} className={S}><option value="">Select</option>{gradeLevels.map(g=><option key={g}>{g}</option>)}</select></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
            <select {...register("bookCategory")} className={S}><option value="">Select</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Curriculum Alignment</label>
            <select {...register("curriculumAlignment")} className={S}><option value="">Select</option>{CURRICULUM.map(c=><option key={c}>{c}</option>)}</select></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Language</label>
            <select {...register("language")} className={S}>{LANGUAGES.map(l=><option key={l}>{l}</option>)}</select></div>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Inventory</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Quantity *</label>
            <Input type="number" min={0} {...register("quantity")} placeholder="e.g. 60"/>{errors.quantity&&<p className="text-xs text-destructive">{errors.quantity.message}</p>}</div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In Circulation</label>
            <Input type="number" min={0} {...register("inCirculation")} placeholder="e.g. 55"/></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Condition</label>
            <select {...register("bookCondition")} className={S}>{CONDITIONS.map(c=><option key={c}>{c}</option>)}</select></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cost per Unit (KES)</label>
            <Input type="number" min={0} {...register("costPerUnit")} placeholder="e.g. 350"/></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acquisition Date</label><Input type="date" {...register("acquisitionDate")}/></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Funding Source</label>
            <select {...register("fundingSource")} className={S}><option value="">Select</option>{FUNDING.map(f=><option key={f}>{f}</option>)}</select></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Supplier</label><Input {...register("supplier")} placeholder="e.g. Kenya Literature Bureau"/></div>
          <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Storage Location</label><Input {...register("storageLocation")} placeholder="e.g. Library Shelf A3"/></div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting?"Saving…":"Save Book"}</Button>
      </div>
    </form>
  );
}

export default function SchoolBooks() {
  const { user } = useCurrentUser();
  const institutionId = user?.role !== "super_admin" ? user?.institutionId : undefined;
  const institution = useQuery(api.institutions.getById, institutionId ? { institutionId } : "skip");
  const isVT = institution?.type === "Vocational Training";
  const books = useQuery(api.books.list, institutionId ? { institutionId } : {});
  const createBook = useMutation(api.books.create);
  const updateBook = useMutation(api.books.update);
  const removeBook = useMutation(api.books.remove);
  const [addOpen,setAddOpen] = useState(false);
  const [editItem,setEditItem] = useState<any|null>(null);
  const [deleteId,setDeleteId] = useState<Id<"books">|null>(null);

  async function handleCreate(data:FD) {
    if(!institutionId)return;
    const p:any={...data,institutionId}; Object.keys(p).forEach(k=>{if(p[k]===""||p[k]===undefined)delete p[k];});
    try{await createBook(p);toast.success("Book added");setAddOpen(false);}catch(e:any){toast.error(e.message??"Failed");}
  }
  async function handleUpdate(data:FD) {
    if(!editItem)return;
    const p:any={bookId:editItem._id,...data}; Object.keys(p).forEach(k=>{if(p[k]===""||p[k]===undefined)delete p[k];});
    try{await updateBook(p);toast.success("Updated");setEditItem(null);}catch(e:any){toast.error(e.message??"Failed");}
  }
  async function handleDelete() {
    if(!deleteId)return;
    try{await removeBook({bookId:deleteId});toast.success("Removed");}catch(e:any){toast.error(e.message??"Failed");}
    finally{setDeleteId(null);}
  }

  const totalBooks=(books??[]).reduce((s,b)=>s+b.quantity,0);
  const inCirc=(books??[]).reduce((s,b)=>s+(b.inCirculation??0),0);
  const totalValue=(books??[]).reduce((s,b)=>s+(b.costPerUnit??0)*b.quantity,0);

  return (
    <div className="page-container space-y-6">
      <div className="flex items-start justify-between pb-5 border-b border-border">
        <div><h1 className="section-heading">School Books</h1><p className="text-sm text-muted-foreground mt-0.5">Library and textbook inventory register</p></div>
        {institutionId&&<Button onClick={()=>setAddOpen(true)} className="gap-1.5"><Plus className="h-4 w-4"/>Add Book</Button>}
      </div>

      {(books?.length??0)>0&&(
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[{label:"Titles",value:books?.length??0},{label:"Total Copies",value:totalBooks},{label:"In Circulation",value:inCirc},{label:"Est. Value",value:totalValue>0?`KES ${totalValue.toLocaleString()}`:"—"}]
            .map(({label,value})=><div key={label} className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p><p className="text-xl font-bold mt-1">{value}</p></div>)}
        </div>
      )}

      {books===undefined ? (
        <div className="space-y-2">{[...Array(4)].map((_,i)=><div key={i} className="h-14 bg-muted rounded-xl animate-pulse"/>)}</div>
      ) : books.length===0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-3"/>
          <p className="text-muted-foreground text-sm">No books in the inventory yet</p>
          <Button variant="outline" onClick={()=>setAddOpen(true)} className="mt-3 gap-1.5"><Plus className="h-3.5 w-3.5"/>Add First Book</Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>{["Title","Author","Subject","Grade","Category","Qty","In Circ.","Condition","Cost/Unit",""].map(h=>(
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}</tr></thead>
            <tbody className="divide-y divide-border/60">
              {books.map(b=>(
                <tr key={b._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-[200px]"><p className="truncate">{b.title}</p>{b.isbn&&<p className="text-xs text-muted-foreground font-mono">{b.isbn}</p>}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{b.author??"—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{b.subject??"—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{b.gradeLevel??"—"}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">{b.bookCategory??"—"}</td>
                  <td className="px-4 py-3 font-medium">{b.quantity}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.inCirculation??<span className="text-muted-foreground/40">—</span>}</td>
                  <td className="px-4 py-3">
                    {b.bookCondition&&<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${COND_COLORS[b.bookCondition]??""}`}>{b.bookCondition}</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{b.costPerUnit?`KES ${b.costPerUnit.toLocaleString()}`:"—"}</td>
                  <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1">
                    <button onClick={()=>setEditItem(b)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Pencil className="h-3.5 w-3.5 text-muted-foreground"/></button>
                    <button onClick={()=>setDeleteId(b._id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5 text-red-500"/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={o=>!o&&setAddOpen(false)}>
        <DialogContent aria-describedby={undefined} className="max-w-xl"><DialogHeader><DialogTitle>Add Book to Inventory</DialogTitle></DialogHeader>
          <BookForm isVT={isVT} onSubmit={handleCreate} onClose={()=>setAddOpen(false)}/></DialogContent>
      </Dialog>
      <Dialog open={!!editItem} onOpenChange={o=>!o&&setEditItem(null)}>
        <DialogContent aria-describedby={undefined} className="max-w-xl"><DialogHeader><DialogTitle>Edit Book</DialogTitle></DialogHeader>
          {editItem&&<BookForm isVT={isVT} defaults={editItem} onSubmit={handleUpdate} onClose={()=>setEditItem(null)}/>}</DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteId} onOpenChange={o=>!o&&setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove book?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
