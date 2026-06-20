import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireRole } from "./lib/auth";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["super_admin"]);
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_createdAt")
      .order("desc")
      .take(args.limit ?? 50);

    // Enrich with user names
    const enriched = await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.userId);
        return { ...log, userName: user?.fullName ?? "Unknown" };
      })
    );
    return enriched;
  },
});
