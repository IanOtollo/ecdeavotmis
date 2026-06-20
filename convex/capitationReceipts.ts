import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const list = query({
  args: { institutionId: v.optional(v.id("institutions")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const scopeId = user.role === "super_admin" ? args.institutionId : user.institutionId;
    if (!scopeId) return [];
    const records = await ctx.db.query("capitationReceipts").withIndex("by_institutionId", (q) => q.eq("institutionId", scopeId)).collect();
    return records.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: {
    institutionId: v.id("institutions"),
    amount: v.number(),
    receiptNo: v.string(),
    disbursementDate: v.string(),
    depositDate: v.optional(v.string()),
    term: v.string(),
    financialYear: v.string(),
    disbursementSource: v.optional(v.string()),
    disbursementChannel: v.optional(v.string()),
    chequeNo: v.optional(v.string()),
    bankRef: v.optional(v.string()),
    learnersCount: v.optional(v.number()),
    purpose: v.optional(v.string()),
    reconciliationStatus: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "super_admin" && user.institutionId !== args.institutionId) throw new Error("Access denied");
    return await ctx.db.insert("capitationReceipts", { ...args, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    receiptId: v.id("capitationReceipts"),
    amount: v.optional(v.number()),
    receiptNo: v.optional(v.string()),
    disbursementDate: v.optional(v.string()),
    depositDate: v.optional(v.string()),
    term: v.optional(v.string()),
    financialYear: v.optional(v.string()),
    disbursementSource: v.optional(v.string()),
    disbursementChannel: v.optional(v.string()),
    chequeNo: v.optional(v.string()),
    bankRef: v.optional(v.string()),
    learnersCount: v.optional(v.number()),
    purpose: v.optional(v.string()),
    reconciliationStatus: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const rec = await ctx.db.get(args.receiptId);
    if (!rec) throw new Error("Receipt not found");
    if (user.role !== "super_admin" && user.institutionId !== rec.institutionId) throw new Error("Access denied");
    const { receiptId, ...updates } = args;
    await ctx.db.patch(receiptId, updates);
  },
});

export const remove = mutation({
  args: { receiptId: v.id("capitationReceipts") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const rec = await ctx.db.get(args.receiptId);
    if (!rec) throw new Error("Receipt not found");
    if (user.role !== "super_admin" && user.institutionId !== rec.institutionId) throw new Error("Access denied");
    await ctx.db.delete(args.receiptId);
  },
});
