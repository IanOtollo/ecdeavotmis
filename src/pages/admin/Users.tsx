import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Plus, UserCog, KeyRound, Eye, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Id } from "../../../convex/_generated/dataModel";

const createSchema = z.object({
  email: z.string().email("Valid email required"),
  fullName: z.string().min(2, "Full name required"),
  role: z.enum(["institution_admin", "teacher", "data_clerk"]),
  institutionId: z.string().min(1, "Institution required"),
  temporaryPassword: z.string().min(8, "Password must be at least 8 characters"),
});
type CreateForm = z.infer<typeof createSchema>;

const resetSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type ResetForm = z.infer<typeof resetSchema>;

const roleLabels: Record<string, string> = {
  super_admin: "County Admin",
  institution_admin: "Institution Admin",
  teacher: "Teacher",
  data_clerk: "Data Clerk",
};

export default function AdminUsers() {
  const users         = useQuery(api.users.list);
  const institutions  = useQuery(api.institutions.list);
  const createUser    = useMutation(api.users.create);
  const updateStatus  = useMutation(api.users.updateStatus);
  const resetPassword = useAction(api.users.resetPassword);

  const [addOpen, setAddOpen]         = useState(false);
  const [resetTarget, setResetTarget] = useState<{ id: Id<"users">; email: string; name: string } | null>(null);
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchQ, setSearchQ]         = useState("");

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  const resetForm  = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  const q = searchQ.toLowerCase().trim();
  const filtered = users
    ? (q
        ? users.filter(u =>
            (u.fullName ?? u.name ?? "").toLowerCase().includes(q) ||
            (u.email ?? "").toLowerCase().includes(q) ||
            (roleLabels[u.role ?? ""] ?? "").toLowerCase().includes(q)
          )
        : users)
    : [];

  async function onCreateSubmit(data: CreateForm) {
    try {
      await createUser({ ...data, institutionId: data.institutionId as Id<"institutions"> });
      toast.success(`User ${data.email} created. Temporary password: ${data.temporaryPassword}`);
      createForm.reset();
      setAddOpen(false);
    } catch (e: any) { toast.error(e.message ?? "Failed to create user"); }
  }

  async function onResetSubmit(data: ResetForm) {
    if (!resetTarget) return;
    try {
      await resetPassword({ userId: resetTarget.id, newPassword: data.newPassword });
      toast.success(`Password reset for ${resetTarget.email}`);
      resetForm.reset();
      setResetTarget(null);
      setShowPwd(false);
      setShowConfirm(false);
    } catch (e: any) { toast.error(e.message ?? "Failed to reset password"); }
  }

  async function toggleStatus(userId: Id<"users">, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await updateStatus({ userId, status: newStatus });
      toast.success(`User ${newStatus}`);
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
  }

  return (
    <div className="page-container space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="section-heading">Manage Users</h1>
          <p className="text-sm text-muted-foreground mt-1">{users?.length ?? 0} users in the system</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search by name, email, role…"
              className="pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 w-64"
            />
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      {/* Loading skeleton */}
      {users === undefined && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {users !== undefined && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UserCog className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">
            {searchQ ? `No users match "${searchQ}"` : "No users yet"}
          </p>
        </div>
      )}

      {/* Table */}
      {users !== undefined && filtered.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Name", "Email", "Role", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((u) => (
                <tr key={u._id} className="data-table-row">
                  <td className="px-4 py-3 font-medium">{u.fullName ?? u.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                      {roleLabels[u.role ?? ""] ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {u.status ?? "active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== "super_admin" && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm" variant="outline" className="text-xs gap-1"
                          onClick={() => {
                            resetForm.reset();
                            setShowPwd(false);
                            setShowConfirm(false);
                            setResetTarget({ id: u._id, email: u.email ?? "", name: u.fullName ?? u.email ?? "" });
                          }}
                        >
                          <KeyRound className="h-3 w-3" /> Reset Password
                        </Button>
                        <Button
                          size="sm" variant="outline" className="text-xs"
                          onClick={() => toggleStatus(u._id, u.status ?? "active")}
                        >
                          {u.status === "active" ? "Suspend" : "Activate"}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => !o && setAddOpen(false)}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name *</label>
                <Input {...createForm.register("fullName")} placeholder="e.g. John Mukhwana" />
                {createForm.formState.errors.fullName && <p className="text-xs text-destructive">{createForm.formState.errors.fullName.message}</p>}
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email *</label>
                <Input type="email" {...createForm.register("email")} placeholder="user@institution.go.ke" />
                {createForm.formState.errors.email && <p className="text-xs text-destructive">{createForm.formState.errors.email.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role *</label>
                <select {...createForm.register("role")} className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm">
                  <option value="">Select role</option>
                  <option value="institution_admin">Institution Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="data_clerk">Data Clerk</option>
                </select>
                {createForm.formState.errors.role && <p className="text-xs text-destructive">{createForm.formState.errors.role.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Institution *</label>
                <select {...createForm.register("institutionId")} className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm">
                  <option value="">Select institution</option>
                  {(institutions ?? []).map((i) => (
                    <option key={i._id} value={i._id}>{i.name}</option>
                  ))}
                </select>
                {createForm.formState.errors.institutionId && <p className="text-xs text-destructive">{createForm.formState.errors.institutionId.message}</p>}
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Temporary Password *</label>
                <Input type="text" {...createForm.register("temporaryPassword")} placeholder="Min 8 characters" />
                {createForm.formState.errors.temporaryPassword && <p className="text-xs text-destructive">{createForm.formState.errors.temporaryPassword.message}</p>}
                <p className="text-xs text-muted-foreground">Share this with the user. They should change it after first login.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createForm.formState.isSubmitting}>
                {createForm.formState.isSubmitting ? "Creating…" : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password dialog */}
      <Dialog open={!!resetTarget} onOpenChange={(o) => { if (!o) { setResetTarget(null); resetForm.reset(); } }}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Reset Password
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 text-sm mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-0.5">User</p>
            <p className="font-medium">{resetTarget?.name}</p>
            <p className="text-muted-foreground text-xs">{resetTarget?.email}</p>
          </div>
          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">New Password *</label>
              <div className="relative">
                <Input type={showPwd ? "text" : "password"} {...resetForm.register("newPassword")} placeholder="Min 8 characters" className="pr-10" />
                <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {resetForm.formState.errors.newPassword && <p className="text-xs text-destructive">{resetForm.formState.errors.newPassword.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Confirm Password *</label>
              <div className="relative">
                <Input type={showConfirm ? "text" : "password"} {...resetForm.register("confirmPassword")} placeholder="Re-enter new password" className="pr-10" />
                <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {resetForm.formState.errors.confirmPassword && <p className="text-xs text-destructive">{resetForm.formState.errors.confirmPassword.message}</p>}
            </div>
            <p className="text-xs text-muted-foreground">The user will be able to sign in immediately with the new password.</p>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => { setResetTarget(null); resetForm.reset(); }}>Cancel</Button>
              <Button type="submit" disabled={resetForm.formState.isSubmitting}>
                {resetForm.formState.isSubmitting ? "Resetting…" : "Reset Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
