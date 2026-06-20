import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useParams, useNavigate } from "react-router";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Pencil, AlertTriangle, UserCircle } from "lucide-react";
import { useStorageUrl } from "@/hooks/useStorageUrl";

const STATUS_COLORS: Record<string, string> = {
  active:      "bg-green-100 text-green-800",
  transferred: "bg-blue-100 text-blue-800",
  released:    "bg-yellow-100 text-yellow-800",
  deceased:    "bg-red-100 text-red-800",
};

function Info({ label, value }: { label: string; value?: string | boolean | null }) {
  if (value === undefined || value === null || value === "") return null;
  const displayValue = typeof value === "boolean" ? (value ? "Yes" : "No") : value;
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-foreground">{displayValue}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-3 bg-muted/40 border-b border-border">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h3>
      </div>
      <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
  );
}

const updateSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  otherName: z.string().optional(),
  gender: z.enum(["male", "female"]),
  dob: z.string().min(1, "Required"),
  classLevel: z.string().optional(),
  parent1Phone: z.string().optional(),
  parent1Name: z.string().optional(),
  status: z.enum(["active", "transferred", "released", "deceased"]),
});
type UpdateForm = z.infer<typeof updateSchema>;

function PhotoDisplay({ photoId }: { photoId?: Id<"_storage"> }) {
  const url = useStorageUrl(photoId);
  if (!url) {
    return (
      <div className="h-28 w-28 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0">
        <UserCircle className="h-14 w-14 text-muted-foreground/30" />
      </div>
    );
  }
  return <img src={url} alt="Learner photo" className="h-28 w-28 rounded-xl object-cover border border-border shrink-0" />;
}

export default function LearnerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const learner = useQuery(api.learners.getById, { learnerId: id as Id<"learners"> });
  const updateLearner  = useMutation(api.learners.update);
  const [editOpen, setEditOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UpdateForm>({
    resolver: zodResolver(updateSchema),
  });

  function openEdit() {
    if (!learner) return;
    reset({
      firstName: learner.firstName,
      lastName: learner.lastName,
      otherName: learner.otherName ?? "",
      gender: learner.gender,
      dob: learner.dob,
      classLevel: learner.classLevel ?? "",
      parent1Phone: learner.parent1Phone ?? "",
      parent1Name: learner.parent1Name ?? "",
      status: learner.status,
    });
    setEditOpen(true);
  }

  async function onUpdate(data: UpdateForm) {
    try {
      await updateLearner({ learnerId: id as Id<"learners">, ...data });
      toast.success("Learner record updated");
      setEditOpen(false);
    } catch (e: any) {
      toast.error(e.message ?? "Update failed");
    }
  }

  if (learner === undefined) {
    return (
      <div className="page-container space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (learner === null) {
    return (
      <div className="page-container flex flex-col items-center justify-center py-24 text-center gap-4">
        <AlertTriangle className="h-10 w-10 text-muted-foreground/30" />
        <p className="text-muted-foreground">Learner not found or you do not have permission to view this record.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const fullName = [learner.firstName, learner.otherName, learner.lastName].filter(Boolean).join(" ");
  const ageYears = learner.dob
    ? Math.floor((Date.now() - new Date(learner.dob).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null;

  return (
    <div className="page-container space-y-6">
      {/* ── Breadcrumb / Back ── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Learners
      </button>

      {/* ── Header card ── */}
      <div className="rounded-xl border border-border bg-card p-6 flex items-start gap-5">
        <PhotoDisplay photoId={learner.photoId} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-foreground leading-tight">{fullName}</h1>
              <p className="font-mono text-sm text-muted-foreground mt-0.5 tracking-wider">{learner.upi}</p>
            </div>
            <Button size="sm" variant="outline" onClick={openEdit} className="gap-1.5 shrink-0">
              <Pencil className="h-3.5 w-3.5" /> Edit Record
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[learner.status]}`}>
              {learner.status.charAt(0).toUpperCase() + learner.status.slice(1)}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {learner.programType === "ecde" ? "ECDE" : "Vocational"}
            </span>
            {learner.classLevel && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                {learner.classLevel}
              </span>
            )}
            {learner.gender && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium capitalize">
                {learner.gender}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Personal Details ── */}
      <Section title="Personal Details">
        <Info label="Full Name" value={fullName} />
        <Info label="Gender" value={learner.gender} />
        <Info label="Date of Birth" value={learner.dob} />
        <Info label="Age" value={ageYears !== null ? `${ageYears} years` : undefined} />
        <Info label="Birth Certificate No." value={learner.birthCertNo} />
        <Info label="National ID No." value={learner.nationalId} />
        <Info label="Nationality" value={learner.nationality} />
        <Info label="Religion" value={learner.religion} />
        <Info label="County of Origin" value={learner.county} />
        <Info label="Sub-County of Origin" value={learner.subCountyOfOrigin} />
      </Section>

      {/* ── Enrolment / Programme ── */}
      <Section title={learner.programType === "ecde" ? "Enrolment Details" : "Programme Details"}>
        <Info label="UPI" value={learner.upi} />
        <Info label="Admission Date" value={learner.admissionDate} />
        <Info label="Admission No." value={learner.admissionNo} />
        <Info label="Class / Year" value={learner.classLevel} />
        {learner.programType === "vocational" && (
          <>
            <Info label="Course / Programme" value={learner.course} />
            <Info label="Intake Period" value={learner.intakePeriod} />
          </>
        )}
        <Info label="Previous School" value={learner.previousSchool} />
        <Info label="Previous UPI" value={learner.previousUpi} />
        {learner.programType === "vocational" && (
          <Info label="Prior Education Level" value={learner.previousEducationLevel} />
        )}
      </Section>

      {/* ── Parent / Guardian 1 ── */}
      {learner.parent1Name && (
        <Section title="Parent / Guardian 1">
          <Info label="Full Name" value={learner.parent1Name} />
          <Info label="Relationship" value={learner.parent1Relationship} />
          <Info label="National ID No." value={learner.parent1IdNo} />
          <Info label="Phone" value={learner.parent1Phone} />
          <Info label="Occupation" value={learner.parent1Occupation} />
          <Info label="Email" value={learner.parent1Email} />
        </Section>
      )}

      {/* ── Parent / Guardian 2 ── */}
      {learner.parent2Name && (
        <Section title="Parent / Guardian 2">
          <Info label="Full Name" value={learner.parent2Name} />
          <Info label="Relationship" value={learner.parent2Relationship} />
          <Info label="Phone" value={learner.parent2Phone} />
        </Section>
      )}

      {/* ── Next of Kin ── */}
      {learner.nextOfKinName && (
        <Section title="Next of Kin">
          <Info label="Full Name" value={learner.nextOfKinName} />
          <Info label="Relationship" value={learner.nextOfKinRelationship} />
          <Info label="Phone" value={learner.nextOfKinPhone} />
          <Info label="Address" value={learner.nextOfKinAddress} />
        </Section>
      )}

      {/* ── Health ── */}
      <Section title="Health & Special Needs">
        <Info label="Has Disability" value={learner.hasDisability} />
        {learner.hasDisability && <Info label="Disability Type" value={learner.disabilityType} />}
        <Info label="Has Chronic Illness" value={learner.hasChronicIllness} />
        {learner.hasChronicIllness && <Info label="Illness Details" value={learner.chronicIllnessDetails} />}
      </Section>

      {/* ── Deceased info ── */}
      {learner.status === "deceased" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-red-700">Deceased Record</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Info label="Date of Death" value={learner.dateOfDeath} />
            <Info label="Cause of Death" value={learner.causeOfDeath} />
            <Info label="Details" value={learner.deathDetails} />
          </div>
        </div>
      )}

      {/* ── Edit dialog ── */}
      <Dialog open={editOpen} onOpenChange={(o) => !o && setEditOpen(false)}>
        <DialogContent aria-describedby={undefined} className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Learner Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onUpdate)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">First Name *</label>
                <Input {...register("firstName")} />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Name *</label>
                <Input {...register("lastName")} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Other Name</label>
                <Input {...register("otherName")} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gender *</label>
                <select {...register("gender")} className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm">
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date of Birth *</label>
                <Input type="date" {...register("dob")} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Class / Year</label>
                <Input {...register("classLevel")} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Guardian Name</label>
                <Input {...register("parent1Name")} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Guardian Phone</label>
                <Input {...register("parent1Phone")} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                <select {...register("status")} className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm">
                  <option value="active">Active</option>
                  <option value="transferred">Transferred</option>
                  <option value="released">Released</option>
                  <option value="deceased">Deceased</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save Changes"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
