import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    fullName: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("super_admin"),
      v.literal("institution_admin"),
      v.literal("teacher"),
      v.literal("data_clerk")
    )),
    institutionId: v.optional(v.id("institutions")),
    status: v.optional(v.union(v.literal("active"), v.literal("suspended"))),
    createdAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("by_institutionId", ["institutionId"])
    .index("by_role", ["role"]),

  institutions: defineTable({
    name: v.string(),
    uniqueCode: v.string(),
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
    ownershipDocId: v.optional(v.id("_storage")),
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
    createdAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_uniqueCode", ["uniqueCode"])
    .index("by_county", ["county"])
    .index("by_type", ["type"]),

  learners: defineTable({
    programType: v.union(v.literal("ecde"), v.literal("vocational")),
    institutionId: v.id("institutions"),
    upi: v.string(),

    /* ── Personal ── */
    firstName: v.string(),
    lastName: v.string(),
    otherName: v.optional(v.string()),
    gender: v.union(v.literal("male"), v.literal("female")),
    dob: v.string(),
    birthCertNo: v.optional(v.string()),
    nationalId: v.optional(v.string()),       // vocational
    nationality: v.optional(v.string()),
    religion: v.optional(v.string()),
    county: v.optional(v.string()),           // county of origin
    subCountyOfOrigin: v.optional(v.string()),

    /* ── Enrolment ── */
    admissionDate: v.string(),
    admissionNo: v.optional(v.string()),      // institution's own number
    classLevel: v.optional(v.string()),       // PP1, PP2 (ECDE); Year 1-3 (vocational)
    course: v.optional(v.string()),           // vocational
    intakePeriod: v.optional(v.string()),     // e.g. "Jan 2026"

    /* ── Photo ── */
    photoId: v.optional(v.id("_storage")),

    /* ── Parent / Guardian 1 ── */
    parent1Name: v.optional(v.string()),
    parent1Relationship: v.optional(v.string()),
    parent1IdNo: v.optional(v.string()),
    parent1Phone: v.optional(v.string()),
    parent1Occupation: v.optional(v.string()),
    parent1Email: v.optional(v.string()),

    /* ── Parent / Guardian 2 ── */
    parent2Name: v.optional(v.string()),
    parent2Relationship: v.optional(v.string()),
    parent2Phone: v.optional(v.string()),

    /* ── Next of Kin (vocational) ── */
    nextOfKinName: v.optional(v.string()),
    nextOfKinRelationship: v.optional(v.string()),
    nextOfKinPhone: v.optional(v.string()),
    nextOfKinAddress: v.optional(v.string()),

    /* ── Previous education ── */
    previousSchool: v.optional(v.string()),
    previousUpi: v.optional(v.string()),
    previousEducationLevel: v.optional(v.string()),

    /* ── Health ── */
    hasDisability: v.optional(v.boolean()),
    disabilityType: v.optional(v.string()),
    hasChronicIllness: v.optional(v.boolean()),
    chronicIllnessDetails: v.optional(v.string()),

    /* ── Status ── */
    status: v.union(
      v.literal("active"),
      v.literal("transferred"),
      v.literal("released"),
      v.literal("deceased")
    ),
    deceased: v.optional(v.boolean()),
    dateOfDeath: v.optional(v.string()),
    causeOfDeath: v.optional(v.string()),
    deathDetails: v.optional(v.string()),

    createdAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_institutionId", ["institutionId"])
    .index("by_upi", ["upi"])
    .index("by_status", ["status"])
    .index("by_programType", ["programType"])
    .index("by_institutionId_status", ["institutionId", "status"]),

  teachers: defineTable({
    institutionId: v.id("institutions"),
    firstName: v.string(),
    lastName: v.string(),
    otherName: v.optional(v.string()),
    gender: v.union(v.literal("male"), v.literal("female")),
    dob: v.optional(v.string()),
    idNo: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    tscNo: v.optional(v.string()),
    role: v.string(),                         // Head Teacher, Teacher, Assistant, etc.
    employmentType: v.optional(v.string()),   // Permanent, BOM, Contract, Volunteer
    qualification: v.optional(v.string()),    // P1, Diploma, Degree, etc.
    specialization: v.optional(v.string()),
    dateHired: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    createdAt: v.number(),
  }).index("by_institutionId", ["institutionId"]),

  infrastructure: defineTable({
    institutionId: v.id("institutions"),
    category: v.string(),
    description: v.string(),
    quantity: v.number(),
    condition: v.string(),
    /* Extended fields */
    ownershipType: v.optional(v.string()),    // Government, Community, Leased, Donated
    dateConstructed: v.optional(v.string()),
    lastMaintained: v.optional(v.string()),
    estimatedCost: v.optional(v.number()),    // KES
    conditionNotes: v.optional(v.string()),
    hasElectricity: v.optional(v.boolean()),
    hasWater: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("by_institutionId", ["institutionId"]),

  emergencies: defineTable({
    institutionId: v.id("institutions"),
    incidentType: v.string(),
    incidentDate: v.string(),
    incidentTime: v.optional(v.string()),
    severity: v.optional(v.string()),         // Minor, Moderate, Severe, Critical
    locationWithin: v.optional(v.string()),   // Classroom, Playground, Admin, etc.
    description: v.string(),
    affectedCount: v.optional(v.number()),
    injuries: v.optional(v.string()),
    policeRef: v.optional(v.string()),
    financialImpact: v.optional(v.number()),
    response: v.optional(v.string()),
    correctiveMeasures: v.optional(v.string()),
    parentNotified: v.optional(v.boolean()),
    insuranceClaim: v.optional(v.boolean()),
    resolvedDate: v.optional(v.string()),
    status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("resolved")),
    reportedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_institutionId", ["institutionId"])
    .index("by_status", ["status"]),

  capitationReceipts: defineTable({
    institutionId: v.id("institutions"),
    amount: v.number(),
    receiptNo: v.string(),
    disbursementDate: v.string(),
    depositDate: v.optional(v.string()),
    term: v.string(),
    financialYear: v.string(),
    disbursementSource: v.optional(v.string()),  // MoE, County, CDF, etc.
    disbursementChannel: v.optional(v.string()), // Bank Transfer, Cheque, M-Pesa
    chequeNo: v.optional(v.string()),
    bankRef: v.optional(v.string()),
    learnersCount: v.optional(v.number()),
    purpose: v.optional(v.string()),
    reconciliationStatus: v.optional(v.string()), // Pending, Reconciled, Discrepancy
    notes: v.optional(v.string()),
    documentId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_institutionId", ["institutionId"]),

  bankAccounts: defineTable({
    institutionId: v.id("institutions"),
    bankName: v.string(),
    branch: v.string(),
    accountName: v.string(),
    accountNo: v.string(),
    accountType: v.optional(v.string()),      // Operating, Capitation, Salary, Special
    openingDate: v.optional(v.string()),
    accountStatus: v.optional(v.string()),    // Active, Dormant, Frozen, Closed
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
    createdAt: v.number(),
  }).index("by_institutionId", ["institutionId"]),

  books: defineTable({
    institutionId: v.id("institutions"),
    title: v.string(),
    author: v.optional(v.string()),
    publisher: v.optional(v.string()),
    isbn: v.optional(v.string()),
    subject: v.optional(v.string()),
    gradeLevel: v.optional(v.string()),
    language: v.optional(v.string()),
    bookCategory: v.optional(v.string()),     // Textbook, Reference, Novel, etc.
    curriculumAlignment: v.optional(v.string()), // CBC, 8-4-4, Non-aligned
    yearPublished: v.optional(v.number()),
    quantity: v.number(),
    inCirculation: v.optional(v.number()),
    bookCondition: v.optional(v.string()),    // New, Good, Fair, Worn, Damaged
    costPerUnit: v.optional(v.number()),
    supplier: v.optional(v.string()),
    acquisitionDate: v.optional(v.string()),
    fundingSource: v.optional(v.string()),    // MoE, County, Donation, Self
    storageLocation: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_institutionId", ["institutionId"]),

  counters: defineTable({
    institutionId: v.id("institutions"),
    lastSeq: v.number(),
  }).index("by_institutionId", ["institutionId"]),

  auditLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    entity: v.string(),
    entityId: v.optional(v.string()),
    meta: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
});
