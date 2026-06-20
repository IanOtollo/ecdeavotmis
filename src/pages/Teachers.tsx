import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

const SELECT_CLS = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  otherName: z.string().optional(),
  gender: z.enum(["male", "female"], { required_error: "Required" }),
  dob: z.string().optional(),
  idNo: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  tscNo: z.string().optional(),
  role: z.string().min(1, "Required"),
  employmentType: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  dateHired: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});
type FormData = z.infer<typeof schema>;

const EMPLOYMENT_TYPES = ["Permanent / TSC", "BOM", "Contract", "Volunteer", "Other"];
const QUALIFICATIONS    = ["Certificate", "P1", "Diploma", "Bachelor's Degree", "Master's Degree", "Other"];
const TEACHER_ROLES     = ["Head Teacher / Principal", "Deputy Head Teacher", "Teacher", "Assistant Teacher", "Instructor", "Support Staff"];

export default function Teachers() {
  const { user } = useCurrentUser();
  const institutionId = user?.role !== "super_admin" ? user?.institutionId : undefined;

  const teachers    = useQuery(api.teachers.list, {});
  const createTeacher = useMutation(api.teachers.create);
  const updateTeacher = useMutation(api.teachers.update);
  const removeTeacher = useMutation(api.teachers.remove);

  const [addOpen,    setAddOpen]    = useState(false);
  const [editTarget, setEditTarget] = useState<Id<"teachers"> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Id<"teachers"> | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "active" },
  });

  function openAdd() {
    reset({ status: "active" });
    setAddOpen(true);
  }

  function openEdit(t: NonNullable<typeof teachers>[number]) {
    reset({
      firstName: t.firstName,
      lastName: t.lastName,
      otherName: t.otherName ?? "",
      gender: t.gender,
      dob: t.dob ?? "",
      idNo: t.idNo ?? "",
      phone: t.phone ?? "",
      email: t.email ?? "",
      tscNo: t.tscNo ?? "",
      role: t.role,
      employmentType: t.employmentType ?? "",
      qualification: t.qualification ?? "",
      specialization: t.specialization ?? "",
      dateHired: t.dateHired ?? "",
      status: (t.status ?? "active") as "active" | "inactive",
    });
    setEditTarget(t._id);
  }

  async function onSubmit(data: FormData) {
    if (!institutionId) { toast.error("No institution assigned"); return; }
    try {
      const payload: any = { ...data, email: data.email || undefined };
      Object.keys(payload).forEach((k) => { if (payload[k] === "") delete payload[k]; });
      if (editTarget) {
        await updateTeacher({ teacherId: editTarget, ...payload });
        toast.success("Teacher record updated");
        setEditTarget(null);
      } else {
        await createTeacher({ institutionId, ...payload });
        toast.success("Teacher added successfully");
        setAddOpen(false);
      }
      reset({ status: "active" });
    } catch (e: any) {
      toast.error(e.message ?? "Operation failed");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await removeTeacher({ teacherId: deleteTarget });
      toast.success("Teacher record removed");
      setDeleteTarget(null);
    } catch (e: any) {
      toast.error(e.message ?? "Delete failed");
    }
  }

  if (!institutionId) {
    return (
      <div className="page-container">
        <p className="text-muted-foreground text-sm">No institution assigned. Contact your administrator.</p>
      </div>
    );
  }

  const TeacherForm = ({ onCancel }: { onCancel: () => void }) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Personal */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Personal Details</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">First Name *</label>
            <Input {...register("firstName")} placeholder="e.g. Joseph" />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Name *</label>
            <Input {...register("lastName")} placeholder="e.g. Wabomba" />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Other Name</label>
            <Input {...register("otherName")} placeholder="Optional" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gender *</label>
            <select {...register("gender")} className={SELECT_CLS}>
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
            {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date of Birth</label>
            <Input type="date" {...register("dob")} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">National ID No.</label>
            <Input {...register("idNo")} placeholder="e.g. 12345678" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone Number</label>
            <Input {...register("phone")} placeholder="e.g. 0712 345 678" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
            <Input type="email" {...register("email")} placeholder="Optional" />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
        </div>
      </div>

      {/* Professional */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 mt-1">Professional Details</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">TSC Number</label>
            <Input {...register("tscNo")} placeholder="e.g. TSC/123456" className="font-mono" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role / Designation *</label>
            <select {...register("role")} className={SELECT_CLS}>
              <option value="">Select role</option>
              {TEACHER_ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Employment Type</label>
            <select {...register("employmentType")} className={SELECT_CLS}>
              <option value="">Select</option>
              {EMPLOYMENT_TYPES.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Qualification</label>
            <select {...register("qualification")} className={SELECT_CLS}>
              <option value="">Select</option>
              {QUALIFICATIONS.map((q) => <option key={q}>{q}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Specialization / Subject</label>
            <Input {...register("specialization")} placeholder="e.g. Mathematics, Science" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date Hired</label>
            <Input type="date" {...register("dateHired")} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
            <select {...register("status")} className={SELECT_CLS}>
              <option value="active">Active</option>
              <option value="inactive">Inactive / Left</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : (editTarget ? "Save Changes" : "Add Teacher")}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between pb-5 border-b border-border">
        <div>
          <h1 className="section-heading">Teaching Staff</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {teachers?.filter((t) => t.status !== "inactive").length ?? 0} active staff members
          </p>
        </div>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Teacher
        </Button>
      </div>

      {teachers === undefined ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : teachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <Users className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">No teaching staff recorded yet.</p>
          <Button variant="outline" onClick={openAdd} className="gap-1.5 mt-1">
            <Plus className="h-3.5 w-3.5" /> Add First Teacher
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Name", "Role", "Employment", "Qualification", "TSC No.", "Phone", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {teachers.map((t) => (
                <tr key={t._id} className="data-table-row">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {t.firstName} {t.otherName ? `${t.otherName[0]}. ` : ""}{t.lastName}
                    <span className="block text-xs text-muted-foreground capitalize">{t.gender}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.role}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.employmentType ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.qualification ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.tscNo ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.status === "active" || !t.status ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {t.status ?? "active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Edit">
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => setDeleteTarget(t._id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Remove">
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => !o && setAddOpen(false)}>
        <DialogContent aria-describedby={undefined} className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Teaching Staff</DialogTitle>
          </DialogHeader>
          <TeacherForm onCancel={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editTarget !== null} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent aria-describedby={undefined} className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Teacher Record</DialogTitle>
          </DialogHeader>
          <TeacherForm onCancel={() => setEditTarget(null)} />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent aria-describedby={undefined} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Teacher</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove this teacher's record? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Remove</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
