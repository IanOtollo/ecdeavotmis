import { getAuthUserId } from "@convex-dev/auth/server";
import { MutationCtx, QueryCtx } from "../_generated/server";

export type UserRole = "super_admin" | "institution_admin" | "teacher" | "data_clerk";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User record not found");
  if (user.status === "suspended") throw new Error("Account suspended");
  return user;
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  roles: UserRole[]
) {
  const user = await getCurrentUser(ctx);
  if (!user.role || !roles.includes(user.role as UserRole)) {
    throw new Error(`Access denied. Required role: ${roles.join(" or ")}`);
  }
  return user;
}
