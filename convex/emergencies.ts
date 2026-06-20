import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const list = query({
  args: {
    institutionId: v.optional(v.id("institutions")),
    status: v.optional(v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const scopeId = user.role === "super_admin" ? args.institutionId : user.institutionId;
    let records;
    if (scopeId) {
      records = await ctx.db.query("emergencies").withIndex("by_institutionId", (q) => q.eq("institutionId", scopeId)).collect();
    } else {
      records = await ctx.db.query("emergencies").collect();
    }
    if (args.status) records = records.filter((r) => r.status === args.status);
    return records.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: {
    institutionId: v.id("institutions"),
    incidentType: v.string(),
    incidentDate: v.string(),
    incidentTime: v.optional(v.string()),
    severity: v.optional(v.string()),
    locationWithin: v.optional(v.string()),
    description: v.string(),
    affectedCount: v.optional(v.number()),
    injuries: v.optional(v.string()),
    policeRef: v.optional(v.string()),
    financialImpact: v.optional(v.number()),
    response: v.optional(v.string()),
    parentNotified: v.optional(v.boolean()),
    insuranceClaim: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "super_admin" && user.institutionId !== args.institutionId) throw new Error("Access denied");
    return await ctx.db.insert("emergencies", {
      ...args,
      status: "open",
      reportedBy: user._id,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    emergencyId: v.id("emergencies"),
    status: v.optional(v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved"))),
    response: v.optional(v.string()),
    correctiveMeasures: v.optional(v.string()),
    resolvedDate: v.optional(v.string()),
    policeRef: v.optional(v.string()),
    financialImpact: v.optional(v.number()),
    affectedCount: v.optional(v.number()),
    injuries: v.optional(v.string()),
    parentNotified: v.optional(v.boolean()),
    insuranceClaim: v.optional(v.boolean()),
    severity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const record = await ctx.db.get(args.emergencyId);
    if (!record) throw new Error("Emergency not found");
    if (user.role !== "super_admin" && user.institutionId !== record.institutionId) throw new Error("Access denied");
    const { emergencyId, ...updates } = args;
    await ctx.db.patch(emergencyId, updates);
  },
});

export const remove = mutation({
  args: { emergencyId: v.id("emergencies") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const record = await ctx.db.get(args.emergencyId);
    if (!record) throw new Error("Emergency not found");
    if (user.role !== "super_admin" && user.institutionId !== record.institutionId) throw new Error("Access denied");
    await ctx.db.delete(args.emergencyId);
  },
});
