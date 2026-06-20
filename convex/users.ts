import { v } from "convex/values";
import { internalMutation, mutation, query, action } from "./_generated/server";
import { getCurrentUser, requireRole } from "./lib/auth";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createAccount } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["super_admin"]);
    return await ctx.db.query("users").collect();
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    fullName: v.string(),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal("institution_admin"),
      v.literal("teacher"),
      v.literal("data_clerk")
    ),
    institutionId: v.optional(v.id("institutions")),
    temporaryPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["super_admin"]);

    const existing = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
    if (existing) throw new Error("A user with this email already exists");

    if (!args.institutionId) {
      throw new Error("Users must be assigned to an institution");
    }

    const { user } = await createAccount(ctx, {
      provider: "password",
      account: {
        id: args.email,
        secret: args.temporaryPassword,
      },
      profile: {
        email: args.email,
        name: args.fullName,
      },
    });

    await ctx.db.patch(user._id, {
      fullName: args.fullName,
      phone: args.phone,
      role: args.role,
      institutionId: args.institutionId,
      status: "active",
      createdAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId: admin._id,
      action: "create_user",
      entity: "users",
      entityId: user._id,
      meta: { email: args.email, role: args.role },
      createdAt: Date.now(),
    });

    return user._id;
  },
});

export const updateStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(v.literal("active"), v.literal("suspended")),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["super_admin"]);
    const target = await ctx.db.get(args.userId);
    if (!target) throw new Error("User not found");
    if (target.role === "super_admin") throw new Error("Cannot suspend super admin");

    await ctx.db.patch(args.userId, { status: args.status });

    await ctx.db.insert("auditLogs", {
      userId: admin._id,
      action: `user_${args.status}`,
      entity: "users",
      entityId: args.userId,
      createdAt: Date.now(),
    });
  },
});

export const updateProfile = mutation({
  args: {
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const updates: Record<string, unknown> = {};
    if (args.fullName !== undefined) updates.fullName = args.fullName;
    if (args.phone !== undefined) updates.phone = args.phone;
    await ctx.db.patch(user._id, updates);
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["super_admin"]);
    return await ctx.db.get(args.userId);
  },
});

export const resetPassword = action({
  args: {
    userId: v.id("users"),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.newPassword.length < 8) throw new Error("Password must be at least 8 characters");

    const caller = await ctx.runQuery(api.users.me);
    if (!caller || caller.role !== "super_admin") throw new Error("Access denied");

    const target = await ctx.runQuery(api.users.getById, { userId: args.userId });
    if (!target?.email) throw new Error("User not found");
    if (target.role === "super_admin") throw new Error("Cannot reset super admin password");

    await (ctx.runMutation as any)(api.auth.store, {
      args: {
        type: "modifyAccount",
        provider: "password",
        account: { id: target.email, secret: args.newPassword },
      },
    });
  },
});
