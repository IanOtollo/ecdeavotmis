import { internalMutation } from "./_generated/server";
import { createAccount } from "@convex-dev/auth/server";

// Run once: npx convex run seed:bootstrapSuperAdmin
export const bootstrapSuperAdmin = internalMutation({
  args: {},
  handler: async (ctx) => {
    const email = "admin@ecdeavotmis.go.ke";

    // Check if super admin already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first();

    if (existing?.role === "super_admin") {
      console.log("[seed] Super admin already exists — skipping");
      return { skipped: true };
    }

    // Create the password account via Convex Auth
    const { user } = await createAccount(ctx, {
      provider: "password",
      account: {
        id: email,
        secret: "bsa@2026",
      },
      profile: {
        email,
        name: "County Chief of Education",
      },
    });

    // Patch our custom application fields onto the auth user record
    await ctx.db.patch(user._id, {
      fullName: "County Chief of Education",
      role: "super_admin",
      status: "active",
      createdAt: Date.now(),
    });

    console.log("==========================================================");
    console.log(" SUPER ADMIN BOOTSTRAPPED — rotate password after first login");
    console.log(`  Email:    ${email}`);
    console.log(`  Password: bsa@2026`);
    console.log("==========================================================");

    return { created: true, userId: user._id };
  },
});
