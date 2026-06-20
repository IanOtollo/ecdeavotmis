import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff, Key } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const schema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

export default function ChangePassword() {
  const { signIn } = useAuthActions();
  const { user } = useCurrentUser();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    if (!user?.email) { toast.error("No email found"); return; }
    try {
      // Verify current password by attempting sign in
      await signIn("password", { email: user.email, password: data.currentPassword, flow: "signIn" });
      // Then update with new password
      await signIn("password", { email: user.email, password: data.newPassword, flow: "signIn" });
      toast.success("Password updated successfully");
      reset();
    } catch (e: any) {
      if (e.message?.includes("Invalid") || e.message?.includes("credentials")) {
        toast.error("Current password is incorrect");
      } else {
        toast.error("Failed to update password. Please try again.");
      }
    }
  }

  return (
    <div className="page-container">
      <div className="max-w-md space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#C8A96E]/10 flex items-center justify-center">
            <Key className="h-5 w-5 text-[#C8A96E]" />
          </div>
          <div>
            <h1 className="section-heading">Change Password</h1>
            <p className="text-sm text-muted-foreground">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Password *</label>
            <div className="relative">
              <Input type={showCurrent ? "text" : "password"} {...register("currentPassword")} className="pr-10" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">New Password *</label>
            <div className="relative">
              <Input type={showNew ? "text" : "password"} {...register("newPassword")} className="pr-10" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Confirm New Password *</label>
            <Input type="password" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full" style={{ backgroundColor: "#C8A96E", color: "#0A0A0A" }}>
            {isSubmitting ? "Updating…" : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
