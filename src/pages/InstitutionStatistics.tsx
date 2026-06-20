import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Id } from "../../convex/_generated/dataModel";

const GOLD = "#C8A96E";
const SLATE = "#94a3b8";

export default function InstitutionStatistics() {
  const { user } = useCurrentUser();
  const isSuperAdmin = user?.role === "super_admin";
  const institutionId = !isSuperAdmin ? user?.institutionId as Id<"institutions"> | undefined : undefined;

  // All hooks called unconditionally
  const kpis = useQuery(api.dashboard.countyKpis);
  const institution = useQuery(
    api.institutions.getById,
    institutionId ? { institutionId } : "skip"
  );
  const learners = useQuery(api.learners.list, institutionId ? { institutionId } : {});
  const teachers  = useQuery(api.teachers.list, institutionId ? { institutionId } : "skip");
  const institutions = useQuery(isSuperAdmin ? api.institutions.list : api.institutions.list);

  const isVT = institution?.type === "Vocational Training";

  if (kpis === undefined || learners === undefined) {
    return (
      <div className="page-container space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded"/>
        <div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="h-32 bg-muted rounded-xl"/>)}</div>
      </div>
    );
  }

  // --- Institution-scoped view ---
  if (!isSuperAdmin && institution) {
    const activeLearners = learners.filter(l=>l.status==="active");
    const males   = activeLearners.filter(l=>l.gender==="male").length;
    const females = activeLearners.filter(l=>l.gender==="female").length;
    const inactive = learners.filter(l=>l.status!=="active").length;
    const specialNeeds = activeLearners.filter(l=>l.hasDisability).length;
    const nonNationals = activeLearners.filter(l=>l.nationality && l.nationality !== "Kenyan").length;

    const genderData = [{ name:"Male", value:males }, { name:"Female", value:females }].filter(d=>d.value>0);

    const groupKey = isVT ? "courseYear" : "class";
    const classGroups = [...new Set(activeLearners.map(l=>(l as any)[groupKey]).filter(Boolean))].sort();
    const classData = classGroups.map(c => ({
      name: isVT ? `Year ${c}` : String(c),
      count: activeLearners.filter(l=>(l as any)[groupKey]===c).length,
    }));

    const statCards = [
      {label:"Total Learners",value:learners.length},
      {label:"Active",value:activeLearners.length},
      {label:"Male",value:males},
      {label:"Female",value:females},
      {label:"Inactive",value:inactive},
      {label:"Special Needs",value:specialNeeds},
      {label:"Non-Kenyan",value:nonNationals},
      {label:"Teaching Staff",value:teachers?.length??0},
    ];

    return (
      <div className="page-container space-y-6">
        <div className="pb-5 border-b border-border">
          <h1 className="section-heading">Statistics — {institution.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{institution.type} · {institution.subcounty} Sub-county</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(s=>(
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {genderData.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Gender Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    <Cell fill={GOLD}/><Cell fill={SLATE}/>
                  </Pie>
                  <Tooltip/><Legend iconType="circle" iconSize={8}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {classData.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{isVT?"Learners by Course Year":"Learners by Class"}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={classData} margin={{left:-20}}>
                  <XAxis dataKey="name" tick={{fontSize:10}}/>
                  <YAxis tick={{fontSize:10}} allowDecimals={false}/>
                  <Tooltip/>
                  <Bar dataKey="count" name="Learners" fill={GOLD} radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Super admin county-wide view ---
  const byInstitution = (institutions ?? []).map(inst => {
    const instLearners = learners.filter(l => l.institutionId === inst._id);
    return {
      name: inst.name.length > 18 ? inst.name.slice(0,18)+"…" : inst.name,
      ecde: instLearners.filter(l=>l.programType==="ecde"&&l.status==="active").length,
      vocational: instLearners.filter(l=>l.programType==="vocational"&&l.status==="active").length,
      total: instLearners.filter(l=>l.status==="active").length,
    };
  }).filter(i=>i.total>0);

  const typeBreakdown = [
    { name:"ECDE", value:(institutions??[]).filter(i=>i.type==="ECDE").length },
    { name:"Vocational", value:(institutions??[]).filter(i=>i.type==="Vocational Training").length },
  ].filter(d=>d.value>0);

  return (
    <div className="page-container space-y-6">
      <div className="pb-5 border-b border-border">
        <h1 className="section-heading">County Statistics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Busia County — ECDE & Vocational Training overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {label:"Total Institutions",value:kpis.totalInstitutions},
          {label:"Active Learners",value:kpis.totalActiveLearners},
          {label:"ECDE Learners",value:kpis.ecdeLearners},
          {label:"Vocational Learners",value:kpis.vocationalLearners},
        ].map(s=>(
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {typeBreakdown.length>0&&(
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Institutions by Type</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={typeBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  <Cell fill={GOLD}/><Cell fill={SLATE}/>
                </Pie>
                <Tooltip/><Legend iconType="circle" iconSize={8}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {byInstitution.length>0&&(
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Learners per Institution (Active)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byInstitution} margin={{left:-20}}>
                <XAxis dataKey="name" tick={{fontSize:9}}/>
                <YAxis tick={{fontSize:9}} allowDecimals={false}/>
                <Tooltip/>
                <Bar dataKey="ecde" name="ECDE" stackId="a" fill={GOLD}/>
                <Bar dataKey="vocational" name="Vocational" stackId="a" fill={SLATE} radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {byInstitution.length>0&&(
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>{["Institution","ECDE","Vocational","Total"].map(h=>(
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
            ))}</tr></thead>
            <tbody className="divide-y divide-border/60">
              {byInstitution.sort((a,b)=>b.total-a.total).map(i=>(
                <tr key={i.name} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{i.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.ecde||"—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.vocational||"—"}</td>
                  <td className="px-4 py-3 font-semibold">{i.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
