import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const list = query({
  args: { institutionId: v.optional(v.id("institutions")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const scopeId = user.role === "super_admin" ? args.institutionId : user.institutionId;
    if (!scopeId) return [];
    return await ctx.db
      .query("teachers")
      .withIndex("by_institutionId", (q) => q.eq("institutionId", scopeId))
      .collect();
  },
});

const teacherArgs = {
  firstName: v.string(),
  lastName: v.string(),
  otherName: v.optional(v.string()),
  gender: v.union(v.literal("male"), v.literal("female")),
  dob: v.optional(v.string()),
  idNo: v.optional(v.string()),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  tscNo: v.optional(v.string()),
  role: v.string(),
  employmentType: v.optional(v.string()),
  qualification: v.optional(v.string()),
  specialization: v.optional(v.string()),
  dateHired: v.optional(v.string()),
  status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
};

export const create = mutation({
  args: { institutionId: v.id("institutions"), ...teacherArgs },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "super_admin" && user.institutionId !== args.institutionId) {
      throw new Error("Access denied");
    }
    return await ctx.db.insert("teachers", { ...args, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    teacherId: v.id("teachers"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    otherName: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    dob: v.optional(v.string()),
    idNo: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    tscNo: v.optional(v.string()),
    role: v.optional(v.string()),
    employmentType: v.optional(v.string()),
    qualification: v.optional(v.string()),
    specialization: v.optional(v.string()),
    dateHired: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher) throw new Error("Teacher not found");
    if (user.role !== "super_admin" && user.institutionId !== teacher.institutionId) {
      throw new Error("Access denied");
    }
    const { teacherId, ...updates } = args;
    await ctx.db.patch(teacherId, updates);
  },
});

export const remove = mutation({
  args: { teacherId: v.id("teachers") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher) throw new Error("Teacher not found");
    if (user.role !== "super_admin" && user.institutionId !== teacher.institutionId) {
      throw new Error("Access denied");
    }
    await ctx.db.delete(args.teacherId);
  },
});
