import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Plus, Building2, Search, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Id } from "../../convex/_generated/dataModel";

/* ── Busia County official sub-counties and wards (IEBC 2017) ── */
const BUSIA_SUBCOUNTIES: Record<string, string[]> = {
  "Teso North": [
    "Malaba North",
    "Malaba South",
    "Ang'urai South",
    "Ang'urai North",
    "Ang'urai East",
  ],
  "Teso South": [
    "Amukura East",
    "Amukura West",
    "Amukura Central",
    "Chakol South",
    "Chakol North",
  ],
  "Nambale": [
    "Nambale Township",
    "Bukhayo North/Walatsi",
    "Bukhayo East",
    "Bukhayo Central",
  ],
  "Matayos": [
    "Matayos",
    "South Sakwa",
    "Busibwabo",
    "Burumba",
  ],
  "Butula": [
    "Butula",
    "Elugulu",
    "Namboboto Nambuku",
    "Maliki/Mukhola",
    "Marachi East",
  ],
  "Samia": [
    "Funyula",
    "Nangina",
    "Ageng'a Nanguba",
    "Bwiri",
  ],
  "Bunyala": [
    "North Bunyala",
    "South Bunyala",
    "East Bunyala",
    "West Bunyala",
  ],
};

const SELECT_CLS =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 disabled:opacity-50 disabled:cursor-not-allowed";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.string().min(1, "Type is required"),
  county: z.string().min(1, "County is required"),
  subcounty: z.string().min(1, "Sub-county is required"),
  ward: z.string().min(1, "Ward is required"),
  location: z.string().optional(),
  ownership: z.string().optional(),
  registrationNo: z.string().optional(),
  initialPassword: z.string().min(8, "Password must be at least 8 characters"),
});
type FormData = z.infer<typeof schema>;

/* Small component to show credentials after registration */
function CredentialCard({ email, password }: { email: string; password: string }) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  function copy(text: string, which: "email" | "pass") {
    navigator.clipboard.writeText(text);
    if (which === "email") { setCopiedEmail(true); setTimeout(() => setCopiedEmail(false), 2000); }
    else { setCopiedPass(true); setTimeout(() => setCopiedPass(false), 2000); }
  }

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Institution Login Credentials</p>
      {[
        { label: "Login Email", value: email, which: "email" as const, copied: copiedEmail },
        { label: "Password",    value: password, which: "pass" as const, copied: copiedPass },
      ].map(({ label, value, which, copied }) => (
        <div key={label} className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground font-mono truncate">{value}</p>
          </div>
          <button
            onClick={() => copy(value, which)}
            className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      ))}
      <p className="text-[11px] text-muted-foreground border-t border-border pt-2 mt-1">
        Share these with the institution administrator. The password can be changed after first login.
      </p>
    </div>
  );
}

function AddInstitutionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createInstitution = useMutation(api.institutions.create);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { county: "Busia" },
  });

  const selectedSubcounty = watch("subcounty");
  const availableWards = selectedSubcounty ? (BUSIA_SUBCOUNTIES[selectedSubcounty] ?? []) : [];

  function handleSubcountyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setValue("subcounty", e.target.value, { shouldValidate: true });
    setValue("ward", "", { shouldValidate: false });
  }

  async function onSubmit(data: FormData) {
    try {
      const result = await createInstitution({ ...data });
      setCredentials({ email: result.loginEmail, password: data.initialPassword });
      reset({ county: "Busia" });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to register institution");
    }
  }

  function handleClose() {
    setCredentials(null);
    reset({ county: "Busia" });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent aria-describedby={undefined} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Register Institution</DialogTitle>
        </DialogHeader>

        {/* ── Success state: show credentials ── */}
        {credentials ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Check className="h-4 w-4 text-green-600 shrink-0" />
              Institution registered successfully.
            </div>
            <CredentialCard email={credentials.email} password={credentials.password} />
            <div className="flex justify-end pt-2 border-t border-border">
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        ) : (
        /* ── Registration form ── */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">

            <div className="col-span-2 space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Institution Name <span className="text-destructive">*</span>
              </label>
              <Input {...register("name")} placeholder="e.g. Nambale ECDE Centre" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Type <span className="text-destructive">*</span>
              </label>
              <select {...register("type")} className={SELECT_CLS}>
                <option value="">Select type</option>
                <option value="ECDE">ECDE</option>
                <option value="Vocational Training">Vocational Training</option>
              </select>
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ownership</label>
              <select {...register("ownership")} className={SELECT_CLS}>
                <option value="">Select ownership</option>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">County</label>
              <Input {...register("county")} readOnly className="bg-muted text-muted-foreground cursor-default" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sub-county <span className="text-destructive">*</span>
              </label>
              <select value={selectedSubcounty ?? ""} onChange={handleSubcountyChange} className={SELECT_CLS}>
                <option value="">Select sub-county</option>
                {Object.keys(BUSIA_SUBCOUNTIES).map((sc) => (
                  <option key={sc} value={sc}>{sc}</option>
                ))}
              </select>
              {errors.subcounty && <p className="text-xs text-destructive">{errors.subcounty.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ward <span className="text-destructive">*</span>
              </label>
              <select {...register("ward")} disabled={!selectedSubcounty} className={SELECT_CLS}>
                <option value="">{selectedSubcounty ? "Select ward" : "Select sub-county first"}</option>
                {availableWards.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              {errors.ward && <p className="text-xs text-destructive">{errors.ward.message}</p>}
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location / Landmark</label>
              <Input {...register("location")} placeholder="e.g. Near Nambale market" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registration No.</label>
              <Input {...register("registrationNo")} placeholder="e.g. BUS/ECDE/001" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Login Password <span className="text-destructive">*</span>
              </label>
              <Input type="text" {...register("initialPassword")} placeholder="Min 8 characters" />
              {errors.initialPassword && <p className="text-xs text-destructive">{errors.initialPassword.message}</p>}
              <p className="text-[11px] text-muted-foreground">The institution will use this to sign in.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering…" : "Register Institution"}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Institutions() {
  const institutions = useQuery(api.institutions.list);
  const removeInstitution = useMutation(api.institutions.remove);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<Id<"institutions"> | null>(null);

  const filtered = (institutions ?? []).filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.uniqueCode.toLowerCase().includes(search.toLowerCase()) ||
    i.type.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await removeInstitution({ institutionId: deleteId });
      toast.success("Institution removed");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to delete");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between pb-5 border-b border-border">
        <div>
          <h1 className="section-heading">Institutions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {institutions?.length ?? 0} registered institutions in Busia County
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Register Institution
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name, code or type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {institutions === undefined ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">
            {search ? "No institutions match your search" : "No institutions registered yet — add the first one"}
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl border border-border overflow-hidden bg-card"
          style={{ boxShadow: "0 1px 3px hsl(220 15% 65% / 0.08), 0 4px 14px hsl(220 15% 65% / 0.05)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Institution</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Sub-county</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Ward</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((inst) => (
                <tr key={inst._id} onClick={() => navigate(`/institutions/${inst._id}`)} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-medium text-foreground">{inst.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="upi-code text-muted-foreground text-xs">{inst.uniqueCode}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="outline" className="text-xs">{inst.type}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{inst.subcounty}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{inst.ward ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(inst._id); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddInstitutionDialog open={addOpen} onClose={() => setAddOpen(false)} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete institution?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the institution and cannot be undone. Learner records linked to this institution may be orphaned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
