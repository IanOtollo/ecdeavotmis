import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

const bankFields = {
  bankName: v.string(),
  branch: v.string(),
  accountName: v.string(),
  accountNo: v.string(),
  accountType: v.optional(v.string()),
  openingDate: v.optional(v.string()),
  accountStatus: v.optional(v.string()),
  isPrimary: v.optional(v.boolean()),
  isCapitationAccount: v.optional(v.boolean()),
  signatory1Name: v.optional(v.string()),
  signatory1Role: v.optional(v.string()),
  signatory1IdNo: v.optional(v.string()),
  signatory2Name: v.optional(v.string()),
  signatory2Role: v.optional(v.string()),
  signatory2IdNo: v.optional(v.string()),
  bankContactPerson: v.optional(v.string()),
  bankContactPhone: v.optional(v.string()),
  notes: v.optional(v.string()),
};

export const list = query({
  args: { institutionId: v.optional(v.id("institutions")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const scopeId = user.role === "super_admin" ? args.institutionId : user.institutionId;
    if (!scopeId) return [];
    return await ctx.db.query("bankAccounts").withIndex("by_institutionId", (q) => q.eq("institutionId", scopeId)).collect();
  },
});

export const create = mutation({
  args: { institutionId: v.id("institutions"), ...bankFields },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "super_admin" && user.institutionId !== args.institutionId) throw new Error("Access denied");
    return await ctx.db.insert("bankAccounts", { ...args, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    accountId: v.id("bankAccounts"),
    bankName: v.optional(v.string()),
    branch: v.optional(v.string()),
    accountName: v.optional(v.string()),
    accountNo: v.optional(v.string()),
    accountType: v.optional(v.string()),
    openingDate: v.optional(v.string()),
    accountStatus: v.optional(v.string()),
    isPrimary: v.optional(v.boolean()),
    isCapitationAccount: v.optional(v.boolean()),
    signatory1Name: v.optional(v.string()),
    signatory1Role: v.optional(v.string()),
    signatory1IdNo: v.optional(v.string()),
    signatory2Name: v.optional(v.string()),
    signatory2Role: v.optional(v.string()),
    signatory2IdNo: v.optional(v.string()),
    bankContactPerson: v.optional(v.string()),
    bankContactPhone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const rec = await ctx.db.get(args.accountId);
    if (!rec) throw new Error("Account not found");
    if (user.role !== "super_admin" && user.institutionId !== rec.institutionId) throw new Error("Access denied");
    const { accountId, ...updates } = args;
    await ctx.db.patch(accountId, updates);
  },
});

export const remove = mutation({
  args: { accountId: v.id("bankAccounts") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const rec = await ctx.db.get(args.accountId);
    if (!rec) throw new Error("Account not found");
    if (user.role !== "super_admin" && user.institutionId !== rec.institutionId) throw new Error("Access denied");
    await ctx.db.delete(args.accountId);
  },
});
