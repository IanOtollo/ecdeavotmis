import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireRole } from "./lib/auth";
import { createAccount } from "@convex-dev/auth/server";

function makeUniqueCode(name: string, seq: number): string {
  const prefix = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3)
    .padEnd(3, "X");
  return `${prefix}${String(seq).padStart(3, "0")}`;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (user.role === "super_admin") {
      return await ctx.db.query("institutions").collect();
    }
    if (!user.institutionId) return [];
    const inst = await ctx.db.get(user.institutionId);
    return inst ? [inst] : [];
  },
});

export const getById = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const institution = await ctx.db.get(args.institutionId);
    if (!institution) return null;
    if (user.role !== "super_admin" && user.institutionId !== args.institutionId) {
      throw new Error("Access denied");
    }
    return institution;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    level: v.optional(v.string()),
    category: v.optional(v.string()),
    county: v.string(),
    subcounty: v.string(),
    ward: v.optional(v.string()),
    zone: v.optional(v.string()),
    location: v.optional(v.string()),
    educationSystem: v.optional(v.string()),
    ownership: v.optional(v.string()),
    kraPin: v.optional(v.string()),
    registrationNo: v.optional(v.string()),
    registrationDate: v.optional(v.string()),
    sbpCompliance: v.optional(v.boolean()),
    geoLat: v.optional(v.number()),
    geoLng: v.optional(v.number()),
    nearestTown: v.optional(v.string()),
    nearestPolice: v.optional(v.string()),
    nearestHealth: v.optional(v.string()),
    initialPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["super_admin"]);

    const { initialPassword, ...institutionFields } = args;

    const all = await ctx.db.query("institutions").collect();
    let seq = all.length + 1;
    let uniqueCode = makeUniqueCode(args.name, seq);

    while (
      await ctx.db
        .query("institutions")
        .withIndex("by_uniqueCode", (q) => q.eq("uniqueCode", uniqueCode))
        .first()
    ) {
      seq++;
      uniqueCode = makeUniqueCode(args.name, seq);
    }

    const institutionId = await ctx.db.insert("institutions", {
      ...institutionFields,
      uniqueCode,
      status: "active",
      createdAt: Date.now(),
      createdBy: admin._id,
    });

    await ctx.db.insert("counters", { institutionId, lastSeq: 0 });

    // Derive login email: {firstword}{typeabbr}@busiacounty.go.ke
    // e.g. "Funyula Youth Polytechnic" (Vocational Training) → funyulavot@busiacounty.go.ke
    //      "Nambale ECDE Centre" (ECDE)                     → nambaleecde@busiacounty.go.ke
    const firstWord = args.name.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    const typeAbbr = args.type === "Vocational Training" ? "vot" : "ecde";
    let loginEmail = `${firstWord}${typeAbbr}@busiacounty.go.ke`;

    // If that email is already taken, append a counter
    let emailSuffix = 2;
    while (
      await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", loginEmail))
        .first()
    ) {
      loginEmail = `${firstWord}${typeAbbr}${emailSuffix}@busiacounty.go.ke`;
      emailSuffix++;
    }
    const { user: instUser } = await createAccount(ctx, {
      provider: "password",
      account: { id: loginEmail, secret: initialPassword },
      profile: { email: loginEmail, name: args.name },
    });
    await ctx.db.patch(instUser._id, {
      fullName: args.name,
      role: "institution_admin",
      institutionId,
      status: "active",
      createdAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId: admin._id,
      action: "create_institution",
      entity: "institutions",
      entityId: institutionId,
      meta: { name: args.name, uniqueCode, loginEmail },
      createdAt: Date.now(),
    });

    return { institutionId, uniqueCode, loginEmail };
  },
});

export const update = mutation({
  args: {
    institutionId: v.id("institutions"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    level: v.optional(v.string()),
    category: v.optional(v.string()),
    subcounty: v.optional(v.string()),
    ward: v.optional(v.string()),
    zone: v.optional(v.string()),
    location: v.optional(v.string()),
    educationSystem: v.optional(v.string()),
    ownership: v.optional(v.string()),
    kraPin: v.optional(v.string()),
    registrationNo: v.optional(v.string()),
    registrationDate: v.optional(v.string()),
    sbpCompliance: v.optional(v.boolean()),
    logoStorageId: v.optional(v.id("_storage")),
    geoLat: v.optional(v.number()),
    geoLng: v.optional(v.number()),
    nearestTown: v.optional(v.string()),
    nearestPolice: v.optional(v.string()),
    nearestHealth: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const { institutionId, ...updates } = args;

    if (user.role !== "super_admin" && user.institutionId !== institutionId) {
      throw new Error("Access denied");
    }

    const institution = await ctx.db.get(institutionId);
    if (!institution) throw new Error("Institution not found");

    await ctx.db.patch(institutionId, updates);

    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "update_institution",
      entity: "institutions",
      entityId: institutionId,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, ["super_admin"]);
    const institution = await ctx.db.get(args.institutionId);
    if (!institution) throw new Error("Institution not found");
    await ctx.db.delete(args.institutionId);

    await ctx.db.insert("auditLogs", {
      userId: admin._id,
      action: "delete_institution",
      entity: "institutions",
      entityId: args.institutionId,
      meta: { name: institution.name },
      createdAt: Date.now(),
    });
  },
});

export const generateLogoUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getCurrentUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getLogoUrl = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    const institution = await ctx.db.get(args.institutionId);
    if (!institution?.logoStorageId) return null;
    return await ctx.storage.getUrl(institution.logoStorageId);
  },
});
