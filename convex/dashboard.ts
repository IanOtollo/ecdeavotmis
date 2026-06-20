import { query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const countyKpis = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user.role === "super_admin") {
      const [institutions, allLearners, teachers, emergencies] = await Promise.all([
        ctx.db.query("institutions").collect(),
        ctx.db.query("learners").collect(),
        ctx.db.query("teachers").collect(),
        ctx.db.query("emergencies").collect(),
      ]);

      const activeLearners = allLearners.filter((l) => l.status === "active");
      const ecdeLearners = activeLearners.filter((l) => l.programType === "ecde");
      const vocationalLearners = activeLearners.filter((l) => l.programType === "vocational");
      const openEmergencies = emergencies.filter((e) => e.status !== "resolved");

      // learners per institution
      const learnersPerInstitution = institutions.map((inst) => ({
        name: inst.name.length > 20 ? inst.name.slice(0, 20) + "…" : inst.name,
        count: activeLearners.filter((l) => l.institutionId === inst._id).length,
      }));

      // institutions by type
      const byType = institutions.reduce(
        (acc, i) => {
          acc[i.type] = (acc[i.type] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // emergencies by status
      const emergenciesByStatus = [
        { status: "Open", count: emergencies.filter((e) => e.status === "open").length },
        { status: "In Progress", count: emergencies.filter((e) => e.status === "in_progress").length },
        { status: "Resolved", count: emergencies.filter((e) => e.status === "resolved").length },
      ];

      // admissions by month (last 6 months)
      const now = Date.now();
      const sixMonthsAgo = now - 6 * 30 * 24 * 60 * 60 * 1000;
      const recentAdmissions = allLearners.filter((l) => l.createdAt >= sixMonthsAgo);
      const admissionsByMonth: Record<string, number> = {};
      recentAdmissions.forEach((l) => {
        const d = new Date(l.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        admissionsByMonth[key] = (admissionsByMonth[key] ?? 0) + 1;
      });

      return {
        totalInstitutions: institutions.length,
        institutionType: null as string | null,
        institutionName: null as string | null,
        institutionLogoId: null as string | null,
        totalActiveLearners: activeLearners.length,
        ecdeLearners: ecdeLearners.length,
        vocationalLearners: vocationalLearners.length,
        totalTeachers: teachers.length,
        openEmergencies: openEmergencies.length,
        learnersPerInstitution,
        institutionsByType: Object.entries(byType).map(([name, value]) => ({ name, value })),
        emergenciesByStatus,
        admissionsByMonth: Object.entries(admissionsByMonth)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count })),
      };
    }

    // Institution-scoped dashboard
    if (!user.institutionId) {
      return {
        totalInstitutions: 0,
        institutionType: null as string | null,
        institutionName: null as string | null,
        institutionLogoId: null as string | null,
        totalActiveLearners: 0,
        ecdeLearners: 0,
        vocationalLearners: 0,
        totalTeachers: 0,
        openEmergencies: 0,
        learnersPerInstitution: [],
        institutionsByType: [],
        emergenciesByStatus: [],
        admissionsByMonth: [],
      };
    }

    const [institution, learners, teachers, emergencies] = await Promise.all([
      ctx.db.get(user.institutionId!),
      ctx.db
        .query("learners")
        .withIndex("by_institutionId", (q) => q.eq("institutionId", user.institutionId!))
        .collect(),
      ctx.db
        .query("teachers")
        .withIndex("by_institutionId", (q) => q.eq("institutionId", user.institutionId!))
        .collect(),
      ctx.db
        .query("emergencies")
        .withIndex("by_institutionId", (q) => q.eq("institutionId", user.institutionId!))
        .collect(),
    ]);

    const activeLearners = learners.filter((l) => l.status === "active");
    const institutionType = institution?.type ?? "ECDE";

    return {
      totalInstitutions: 1,
      institutionType,
      institutionName: institution?.name ?? null,
      institutionLogoId: institution?.logoStorageId ?? null,
      totalActiveLearners: activeLearners.length,
      ecdeLearners: activeLearners.filter((l) => l.programType === "ecde").length,
      vocationalLearners: activeLearners.filter((l) => l.programType === "vocational").length,
      totalTeachers: teachers.length,
      openEmergencies: emergencies.filter((e) => e.status !== "resolved").length,
      learnersPerInstitution: [],
      institutionsByType: [],
      emergenciesByStatus: [],
      admissionsByMonth: [],
    };
  },
});
