import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

const bookFields = {
  title: v.string(),
  author: v.optional(v.string()),
  publisher: v.optional(v.string()),
  isbn: v.optional(v.string()),
  subject: v.optional(v.string()),
  gradeLevel: v.optional(v.string()),
  language: v.optional(v.string()),
  bookCategory: v.optional(v.string()),
  curriculumAlignment: v.optional(v.string()),
  yearPublished: v.optional(v.number()),
  quantity: v.number(),
  inCirculation: v.optional(v.number()),
  bookCondition: v.optional(v.string()),
  costPerUnit: v.optional(v.number()),
  supplier: v.optional(v.string()),
  acquisitionDate: v.optional(v.string()),
  fundingSource: v.optional(v.string()),
  storageLocation: v.optional(v.string()),
};

export const list = query({
  args: { institutionId: v.optional(v.id("institutions")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const scopeId = user.role === "super_admin" ? args.institutionId : user.institutionId;
    if (!scopeId) return [];
    return await ctx.db.query("books").withIndex("by_institutionId", (q) => q.eq("institutionId", scopeId)).collect();
  },
});

export const create = mutation({
  args: { institutionId: v.id("institutions"), ...bookFields },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "super_admin" && user.institutionId !== args.institutionId) throw new Error("Access denied");
    return await ctx.db.insert("books", { ...args, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    bookId: v.id("books"),
    title: v.optional(v.string()),
    author: v.optional(v.string()),
    publisher: v.optional(v.string()),
    isbn: v.optional(v.string()),
    subject: v.optional(v.string()),
    gradeLevel: v.optional(v.string()),
    language: v.optional(v.string()),
    bookCategory: v.optional(v.string()),
    curriculumAlignment: v.optional(v.string()),
    yearPublished: v.optional(v.number()),
    quantity: v.optional(v.number()),
    inCirculation: v.optional(v.number()),
    bookCondition: v.optional(v.string()),
    costPerUnit: v.optional(v.number()),
    supplier: v.optional(v.string()),
    acquisitionDate: v.optional(v.string()),
    fundingSource: v.optional(v.string()),
    storageLocation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const rec = await ctx.db.get(args.bookId);
    if (!rec) throw new Error("Book not found");
    if (user.role !== "super_admin" && user.institutionId !== rec.institutionId) throw new Error("Access denied");
    const { bookId, ...updates } = args;
    await ctx.db.patch(bookId, updates);
  },
});

export const remove = mutation({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const rec = await ctx.db.get(args.bookId);
    if (!rec) throw new Error("Book not found");
    if (user.role !== "super_admin" && user.institutionId !== rec.institutionId) throw new Error("Access denied");
    await ctx.db.delete(args.bookId);
  },
});
