import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User } from "lucide-react";
import { useEffect } from "react";

const schema = z.object({
  fullName: z.string().min(2, "Full name required"),
  phone: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const roleLabels: Record<string, string> = {
  super_admin: "County Administrator",
  institution_admin: "Institution Admin",
  teacher: "Teacher",
  data_clerk: "Data Clerk",
};

export default function Profile() {
  const { user } = useCurrentUser();
  const updateProfile = useMutation(api.users.updateProfile);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (user) {
      reset({ fullName: user.fullName ?? user.name ?? "", phone: user.phone ?? "" });
    }
  }, [user, reset]);

  async function onSubmit(data: FormData) {
    try {
      await updateProfile(data);
      toast.success("Profile updated");
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
  }

  return (
    <div className="page-container">
      <div className="max-w-md space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#C8A96E]/10 flex items-center justify-center">
            <User className="h-5 w-5 text-[#C8A96E]" />
          </div>
          <div>
            <h1 className="section-heading">My Profile</h1>
            <p className="text-sm text-muted-foreground">{user ? roleLabels[user.role ?? ""] ?? "" : ""}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-2 text-sm">
          <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-t border-border">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium">{roleLabels[user?.role ?? ""] ?? user?.role}</span>
          </div>
          <div className="flex items-center justify-between py-1 border-t border-border">
            <span className="text-muted-foreground">Status</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user?.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {user?.status}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Edit Profile</h3>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name *</label>
            <Input {...register("fullName")} />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</label>
            <Input type="tel" {...register("phone")} placeholder="+254 7XX XXX XXX" />
          </div>
          <Button type="submit" disabled={isSubmitting || !isDirty} style={{ backgroundColor: "#C8A96E", color: "#0A0A0A" }}>
            {isSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
