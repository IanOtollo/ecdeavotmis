import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useEffect } from "react";
import { Id } from "../../convex/_generated/dataModel";

const S = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30";

const SUBCOUNTIES = ["Busia","Teso North","Teso South","Nambale","Matayos","Butula","Samia"];
const EDUCATION_SYSTEMS = ["CBC (Competency-Based Curriculum)","8-4-4","TVET","Islamic (Madrasa)","Other"];
const LEVELS = ["Nursery / Pre-Primary","Lower Primary","Upper Primary","Secondary","Vocational / TVET","Other"];
const OWNERSHIP_TYPES = ["Public","Private","Faith-based","NGO / CBO","Self-Help Group"];

const schema = z.object({
  name: z.string().min(3,"Min 3 chars"),
  type: z.string().min(1,"Required"),
  level: z.string().optional(),
  educationSystem: z.string().optional(),
  county: z.string().min(1,"Required"),
  subcounty: z.string().min(1,"Required"),
  ward: z.string().optional(),
  zone: z.string().optional(),
  location: z.string().optional(),
  ownership: z.string().optional(),
  kraPin: z.string().optional(),
  registrationNo: z.string().optional(),
  registrationDate: z.string().optional(),
  sbpCompliance: z.boolean().optional(),
  geoLat: z.coerce.number().optional(),
  geoLng: z.coerce.number().optional(),
  nearestTown: z.string().optional(),
  nearestPolice: z.string().optional(),
  nearestHealth: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function InstitutionBioData() {
  const { user } = useCurrentUser();
  const institutionId = user?.role !== "super_admin" ? user?.institutionId : undefined;

  const institution = useQuery(
    api.institutions.getById,
    institutionId ? { institutionId: institutionId as Id<"institutions"> } : "skip"
  );
  const updateInstitution = useMutation(api.institutions.update);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (institution) {
      reset({
        name: institution.name,
        type: institution.type,
        level: institution.level ?? "",
        educationSystem: institution.educationSystem ?? "",
        county: institution.county,
        subcounty: institution.subcounty,
        ward: institution.ward ?? "",
        zone: institution.zone ?? "",
        location: institution.location ?? "",
        ownership: institution.ownership ?? "",
        kraPin: institution.kraPin ?? "",
        registrationNo: institution.registrationNo ?? "",
        registrationDate: institution.registrationDate ?? "",
        sbpCompliance: institution.sbpCompliance ?? false,
        geoLat: institution.geoLat ?? undefined,
        geoLng: institution.geoLng ?? undefined,
        nearestTown: institution.nearestTown ?? "",
        nearestPolice: institution.nearestPolice ?? "",
        nearestHealth: institution.nearestHealth ?? "",
      });
    }
  }, [institution, reset]);

  async function onSubmit(data: FormData) {
    if (!institution) return;
    const payload: any = { institutionId: institution._id };
    const readonlyFields = new Set(["county"]);
    Object.entries(data).forEach(([k, v]) => { if (!readonlyFields.has(k) && v !== "" && v !== undefined) payload[k] = v; });
    try {
      await updateInstitution(payload);
      toast.success("Institution bio-data updated");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to update");
    }
  }

  if (!institution) {
    return (
      <div className="page-container">
        {institution === undefined ? (
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        ) : (
          <p className="text-muted-foreground text-sm">No institution assigned. Contact administrator.</p>
        )}
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <div className="pb-5 border-b border-border">
        <h1 className="section-heading">Institution Bio-data</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{institution.name} · Update official institution information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Section title="Basic Information">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Institution Name *</label>
              <Input {...register("name")} />{errors.name&&<p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type *</label>
              <select {...register("type")} className={S}>
                <option value="ECDE">ECDE</option>
                <option value="Vocational Training">Vocational Training</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Level</label>
              <select {...register("level")} className={S}><option value="">Select</option>{LEVELS.map(l=><option key={l}>{l}</option>)}</select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Education System / Curriculum</label>
              <select {...register("educationSystem")} className={S}><option value="">Select</option>{EDUCATION_SYSTEMS.map(e=><option key={e}>{e}</option>)}</select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ownership</label>
              <select {...register("ownership")} className={S}><option value="">Select</option>{OWNERSHIP_TYPES.map(o=><option key={o}>{o}</option>)}</select>
            </div>
            <div className="flex items-center gap-3 col-span-2 pt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register("sbpCompliance")} className="h-4 w-4 rounded border-border" />
                School Based Plan (SBP) Compliant
              </label>
            </div>
          </div>
        </Section>

        <Section title="Location">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">County *</label>
              <Input {...register("county")} readOnly className="bg-muted/30" />{errors.county&&<p className="text-xs text-destructive">{errors.county.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sub-county *</label>
              <select {...register("subcounty")} className={S}><option value="">Select</option>{SUBCOUNTIES.map(s=><option key={s}>{s}</option>)}</select>
              {errors.subcounty&&<p className="text-xs text-destructive">{errors.subcounty.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ward</label>
              <Input {...register("ward")} placeholder="e.g. Nambale Ward" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Zone</label>
              <Input {...register("zone")} placeholder="e.g. Nambale Zone A" />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location / Physical Address</label>
              <Input {...register("location")} placeholder="e.g. Along Busia-Malaba Road, off Nambale town" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">GPS Latitude</label>
              <Input type="number" step="0.000001" {...register("geoLat")} placeholder="e.g. 0.4178" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">GPS Longitude</label>
              <Input type="number" step="0.000001" {...register("geoLng")} placeholder="e.g. 34.2355" />
            </div>
          </div>
        </Section>

        <Section title="Registration & Compliance">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registration No.</label>
              <Input {...register("registrationNo")} placeholder="e.g. ECDE/BSA/2015/001" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registration Date</label>
              <Input type="date" {...register("registrationDate")} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">KRA PIN</label>
              <Input {...register("kraPin")} placeholder="e.g. P051000000A" className="font-mono" />
            </div>
          </div>
        </Section>

        <Section title="Nearest Facilities">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nearest Town</label><Input {...register("nearestTown")} placeholder="e.g. Nambale"/></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nearest Police Station</label><Input {...register("nearestPolice")} placeholder="e.g. Nambale Police Post"/></div>
            <div className="space-y-1"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nearest Health Facility</label><Input {...register("nearestHealth")} placeholder="e.g. Nambale Sub-County Hospital"/></div>
          </div>
        </Section>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !isDirty} style={{ backgroundColor: "#C8A96E", color: "#0A0A0A" }}>
            {isSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
