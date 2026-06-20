import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireRole } from "./lib/auth";
import { Id } from "./_generated/dataModel";

async function generateUpi(ctx: any, institutionId: Id<"institutions">): Promise<string> {
  const institution = await ctx.db.get(institutionId);
  if (!institution) throw new Error("Institution not found");

  let counter = await ctx.db
    .query("counters")
    .withIndex("by_institutionId", (q: any) => q.eq("institutionId", institutionId))
    .first();

  if (!counter) {
    const counterId = await ctx.db.insert("counters", { institutionId, lastSeq: 0 });
    counter = await ctx.db.get(counterId);
  }

  const newSeq = (counter!.lastSeq ?? 0) + 1;
  await ctx.db.patch(counter!._id, { lastSeq: newSeq });

  const upi = `B-${institution.uniqueCode}-${String(newSeq).padStart(5, "0")}`;

  // Collision guard (should never hit in practice due to serializable transactions)
  const existing = await ctx.db
    .query("learners")
    .withIndex("by_upi", (q: any) => q.eq("upi", upi))
    .first();
  if (existing) {
    const retrySeq = newSeq + 1;
    await ctx.db.patch(counter!._id, { lastSeq: retrySeq });
    return `B-${institution.uniqueCode}-${String(retrySeq).padStart(5, "0")}`;
  }

  return upi;
}

export const list = query({
  args: {
    institutionId: v.optional(v.id("institutions")),
    status: v.optional(v.string()),
    programType: v.optional(v.union(v.literal("ecde"), v.literal("vocational"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const scopeId = user.role === "super_admin" ? args.institutionId : user.institutionId;

    let learners;
    if (scopeId) {
      learners = await ctx.db
        .query("learners")
        .withIndex("by_institutionId", (q: any) => q.eq("institutionId", scopeId))
        .collect();
    } else {
      learners = await ctx.db.query("learners").collect();
    }

    if (args.status) {
      learners = learners.filter((l: any) => l.status === args.status);
    }
    if (args.programType) {
      learners = learners.filter((l: any) => l.programType === args.programType);
    }

    return learners;
  },
});

export const search = query({
  args: {
    query: v.string(),
    institutionId: v.optional(v.id("institutions")),
    programType: v.optional(v.union(v.literal("ecde"), v.literal("vocational"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const scopeId = user.role === "super_admin" ? args.institutionId : user.institutionId;

    let learners;
    if (scopeId) {
      learners = await ctx.db
        .query("learners")
        .withIndex("by_institutionId", (q: any) => q.eq("institutionId", scopeId))
        .collect();
    } else {
      learners = await ctx.db.query("learners").collect();
    }

    if (args.programType) {
      learners = learners.filter((l: any) => l.programType === args.programType);
    }

    const q = args.query.toLowerCase();
    if (q) {
      learners = learners.filter(
        (l: any) =>
          l.firstName.toLowerCase().includes(q) ||
          l.lastName.toLowerCase().includes(q) ||
          l.upi.toLowerCase().includes(q) ||
          (l.otherName && l.otherName.toLowerCase().includes(q))
      );
    }

    return learners;
  },
});

export const getById = query({
  args: { learnerId: v.id("learners") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const learner = await ctx.db.get(args.learnerId);
    if (!learner) return null;
    if (user.role !== "super_admin" && user.institutionId !== learner.institutionId) {
      throw new Error("Access denied");
    }
    return learner;
  },
});

export const capture = mutation({
  args: {
    programType: v.union(v.literal("ecde"), v.literal("vocational")),
    institutionId: v.id("institutions"),
    /* Personal */
    firstName: v.string(),
    lastName: v.string(),
    otherName: v.optional(v.string()),
    gender: v.union(v.literal("male"), v.literal("female")),
    dob: v.string(),
    birthCertNo: v.optional(v.string()),
    nationalId: v.optional(v.string()),
    nationality: v.optional(v.string()),
    religion: v.optional(v.string()),
    county: v.optional(v.string()),
    subCountyOfOrigin: v.optional(v.string()),
    /* Enrolment */
    admissionDate: v.string(),
    admissionNo: v.optional(v.string()),
    classLevel: v.optional(v.string()),
    course: v.optional(v.string()),
    intakePeriod: v.optional(v.string()),
    /* Photo */
    photoId: v.optional(v.id("_storage")),
    /* Parent/Guardian 1 */
    parent1Name: v.optional(v.string()),
    parent1Relationship: v.optional(v.string()),
    parent1IdNo: v.optional(v.string()),
    parent1Phone: v.optional(v.string()),
    parent1Occupation: v.optional(v.string()),
    parent1Email: v.optional(v.string()),
    /* Parent/Guardian 2 */
    parent2Name: v.optional(v.string()),
    parent2Relationship: v.optional(v.string()),
    parent2Phone: v.optional(v.string()),
    /* Next of Kin */
    nextOfKinName: v.optional(v.string()),
    nextOfKinRelationship: v.optional(v.string()),
    nextOfKinPhone: v.optional(v.string()),
    nextOfKinAddress: v.optional(v.string()),
    /* Previous education */
    previousSchool: v.optional(v.string()),
    previousUpi: v.optional(v.string()),
    previousEducationLevel: v.optional(v.string()),
    /* Health */
    hasDisability: v.optional(v.boolean()),
    disabilityType: v.optional(v.string()),
    hasChronicIllness: v.optional(v.boolean()),
    chronicIllnessDetails: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, [
      "super_admin",
      "institution_admin",
      "teacher",
      "data_clerk",
    ]);

    if (user.role !== "super_admin" && user.institutionId !== args.institutionId) {
      throw new Error("Access denied: cannot capture learner for another institution");
    }

    const upi = await generateUpi(ctx, args.institutionId);

    const learnerId = await ctx.db.insert("learners", {
      ...args,
      upi,
      status: "active",
      createdAt: Date.now(),
      createdBy: user._id,
    });

    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "capture_learner",
      entity: "learners",
      entityId: learnerId,
      meta: { upi, firstName: args.firstName, lastName: args.lastName },
      createdAt: Date.now(),
    });

    return { learnerId, upi };
  },
});

export const update = mutation({
  args: {
    learnerId: v.id("learners"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    otherName: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    dob: v.optional(v.string()),
    birthCertNo: v.optional(v.string()),
    nationalId: v.optional(v.string()),
    nationality: v.optional(v.string()),
    religion: v.optional(v.string()),
    county: v.optional(v.string()),
    subCountyOfOrigin: v.optional(v.string()),
    admissionDate: v.optional(v.string()),
    admissionNo: v.optional(v.string()),
    classLevel: v.optional(v.string()),
    course: v.optional(v.string()),
    intakePeriod: v.optional(v.string()),
    parent1Name: v.optional(v.string()),
    parent1Relationship: v.optional(v.string()),
    parent1IdNo: v.optional(v.string()),
    parent1Phone: v.optional(v.string()),
    parent1Occupation: v.optional(v.string()),
    parent1Email: v.optional(v.string()),
    parent2Name: v.optional(v.string()),
    parent2Relationship: v.optional(v.string()),
    parent2Phone: v.optional(v.string()),
    nextOfKinName: v.optional(v.string()),
    nextOfKinRelationship: v.optional(v.string()),
    nextOfKinPhone: v.optional(v.string()),
    nextOfKinAddress: v.optional(v.string()),
    previousSchool: v.optional(v.string()),
    previousUpi: v.optional(v.string()),
    previousEducationLevel: v.optional(v.string()),
    hasDisability: v.optional(v.boolean()),
    disabilityType: v.optional(v.string()),
    hasChronicIllness: v.optional(v.boolean()),
    chronicIllnessDetails: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const learner = await ctx.db.get(args.learnerId);
    if (!learner) throw new Error("Learner not found");

    if (user.role !== "super_admin" && user.institutionId !== learner.institutionId) {
      throw new Error("Access denied");
    }

    const { learnerId, ...updates } = args;
    await ctx.db.patch(learnerId, updates);
  },
});

export const transfer = mutation({
  args: {
    learnerId: v.id("learners"),
    toInstitutionId: v.id("institutions"),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["super_admin", "institution_admin"]);
    const learner = await ctx.db.get(args.learnerId);
    if (!learner) throw new Error("Learner not found");

    if (user.role !== "super_admin" && user.institutionId !== learner.institutionId) {
      throw new Error("Access denied");
    }

    const fromInstitutionId = learner.institutionId;
    await ctx.db.patch(args.learnerId, {
      institutionId: args.toInstitutionId,
      status: "transferred",
    });

    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "transfer_learner",
      entity: "learners",
      entityId: args.learnerId,
      meta: { from: fromInstitutionId, to: args.toInstitutionId, upi: learner.upi },
      createdAt: Date.now(),
    });
  },
});

export const release = mutation({
  args: { learnerId: v.id("learners") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["super_admin", "institution_admin"]);
    const learner = await ctx.db.get(args.learnerId);
    if (!learner) throw new Error("Learner not found");

    if (user.role !== "super_admin" && user.institutionId !== learner.institutionId) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.learnerId, { status: "released" });
  },
});

export const markDeceased = mutation({
  args: {
    learnerId: v.id("learners"),
    dateOfDeath: v.string(),
    causeOfDeath: v.string(),
    deathDetails: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, [
      "super_admin",
      "institution_admin",
      "data_clerk",
    ]);
    const learner = await ctx.db.get(args.learnerId);
    if (!learner) throw new Error("Learner not found");

    if (user.role !== "super_admin" && user.institutionId !== learner.institutionId) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.learnerId, {
      status: "deceased",
      deceased: true,
      dateOfDeath: args.dateOfDeath,
      causeOfDeath: args.causeOfDeath,
      deathDetails: args.deathDetails,
    });

    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "mark_deceased",
      entity: "learners",
      entityId: args.learnerId,
      meta: { upi: learner.upi },
      createdAt: Date.now(),
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getCurrentUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getPhotoUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
