import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

const infraFields = {
  category: v.string(),
  description: v.string(),
  quantity: v.number(),
  condition: v.string(),
  ownershipType: v.optional(v.string()),
  dateConstructed: v.optional(v.string()),
  lastMaintained: v.optional(v.string()),
  estimatedCost: v.optional(v.number()),
  conditionNotes: v.optional(v.string()),
  hasElectricity: v.optional(v.boolean()),
  hasWater: v.optional(v.boolean()),
};

export const list = query({
  args: { institutionId: v.optional(v.id("institutions")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const scopeId = user.role === "super_admin" ? args.institutionId : user.institutionId;
    if (!scopeId) return [];
    return await ctx.db
      .query("infrastructure")
      .withIndex("by_institutionId", (q) => q.eq("institutionId", scopeId))
      .collect();
  },
});

export const create = mutation({
  args: { institutionId: v.id("institutions"), ...infraFields },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "super_admin" && user.institutionId !== args.institutionId) {
      throw new Error("Access denied");
    }
    return await ctx.db.insert("infrastructure", { ...args, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    infraId: v.id("infrastructure"),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    quantity: v.optional(v.number()),
    condition: v.optional(v.string()),
    ownershipType: v.optional(v.string()),
    dateConstructed: v.optional(v.string()),
    lastMaintained: v.optional(v.string()),
    estimatedCost: v.optional(v.number()),
    conditionNotes: v.optional(v.string()),
    hasElectricity: v.optional(v.boolean()),
    hasWater: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const item = await ctx.db.get(args.infraId);
    if (!item) throw new Error("Infrastructure not found");
    if (user.role !== "super_admin" && user.institutionId !== item.institutionId) throw new Error("Access denied");
    const { infraId, ...updates } = args;
    await ctx.db.patch(infraId, updates);
  },
});

export const remove = mutation({
  args: { infraId: v.id("infrastructure") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const item = await ctx.db.get(args.infraId);
    if (!item) throw new Error("Infrastructure not found");
    if (user.role !== "super_admin" && user.institutionId !== item.institutionId) throw new Error("Access denied");
    await ctx.db.delete(args.infraId);
  },
});
