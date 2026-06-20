import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, CheckCircle2, Camera, Printer } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

interface Props { programType: "ecde" | "vocational"; }

const SELECT_CLS = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30";
const LABEL_CLS  = "block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1";

function Field({ label, error, children, required, span2 }: {
  label: string; error?: string; children: React.ReactNode; required?: boolean; span2?: boolean;
}) {
  return (
    <div className={`space-y-1${span2 ? " sm:col-span-2" : ""}`}>
      <label className={LABEL_CLS}>{label}{required && <span className="text-destructive ml-0.5">*</span>}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Section({ title, children, cols = 3 }: { title: string; children: React.ReactNode; cols?: number }) {
  const gridCls = cols === 2
    ? "p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
    : "p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-3 bg-muted/40 border-b border-border">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h3>
      </div>
      <div className={gridCls}>{children}</div>
    </div>
  );
}

/* ── Schemas ── */
const ecdeSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  otherName: z.string().optional(),
  gender: z.enum(["male", "female"], { required_error: "Required" }),
  dob: z.string().min(1, "Required"),
  birthCertNo: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  county: z.string().optional(),
  subCountyOfOrigin: z.string().optional(),
  classLevel: z.string().min(1, "Required"),
  admissionDate: z.string().min(1, "Required"),
  admissionNo: z.string().optional(),
  parent1Name: z.string().min(1, "Required"),
  parent1Relationship: z.string().min(1, "Required"),
  parent1IdNo: z.string().optional(),
  parent1Phone: z.string().min(1, "Required"),
  parent1Occupation: z.string().optional(),
  parent1Email: z.string().email("Invalid email").optional().or(z.literal("")),
  parent2Name: z.string().optional(),
  parent2Relationship: z.string().optional(),
  parent2Phone: z.string().optional(),
  previousSchool: z.string().optional(),
  previousUpi: z.string().optional(),
  hasDisability: z.enum(["yes", "no"]).optional(),
  disabilityType: z.string().optional(),
  hasChronicIllness: z.enum(["yes", "no"]).optional(),
  chronicIllnessDetails: z.string().optional(),
});

const vocationalSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  otherName: z.string().optional(),
  gender: z.enum(["male", "female"], { required_error: "Required" }),
  dob: z.string().min(1, "Required"),
  nationalId: z.string().optional(),
  birthCertNo: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  county: z.string().optional(),
  subCountyOfOrigin: z.string().optional(),
  course: z.string().min(1, "Required"),
  classLevel: z.string().optional(),
  intakePeriod: z.string().min(1, "Required"),
  admissionDate: z.string().min(1, "Required"),
  admissionNo: z.string().optional(),
  previousEducationLevel: z.string().optional(),
  previousSchool: z.string().optional(),
  previousUpi: z.string().optional(),
  nextOfKinName: z.string().min(1, "Required"),
  nextOfKinRelationship: z.string().min(1, "Required"),
  nextOfKinPhone: z.string().min(1, "Required"),
  nextOfKinAddress: z.string().optional(),
  parent1Name: z.string().optional(),
  parent1Phone: z.string().optional(),
  parent1Relationship: z.string().optional(),
  parent1IdNo: z.string().optional(),
  parent1Occupation: z.string().optional(),
  parent1Email: z.string().optional(),
  parent2Name: z.string().optional(),
  parent2Relationship: z.string().optional(),
  parent2Phone: z.string().optional(),
  hasDisability: z.enum(["yes", "no"]).optional(),
  disabilityType: z.string().optional(),
  hasChronicIllness: z.enum(["yes", "no"]).optional(),
  chronicIllnessDetails: z.string().optional(),
});

const KENYA_COUNTIES = [
  "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita-Taveta","Garissa","Wajir","Mandera",
  "Marsabit","Isiolo","Meru","Tharaka-Nithi","Embu","Kitui","Machakos","Makueni","Nyandarua",
  "Nyeri","Kirinyaga","Murang'a","Kiambu","Turkana","West Pokot","Samburu","Trans Nzoia",
  "Uasin Gishu","Elgeyo-Marakwet","Nandi","Baringo","Laikipia","Nakuru","Narok","Kajiado",
  "Kericho","Bomet","Kakamega","Vihiga","Bungoma","Busia","Siaya","Kisumu","Homa Bay",
  "Migori","Kisii","Nyamira","Nairobi",
];

const DISABILITY_TYPES = [
  "Visual Impairment","Hearing Impairment","Physical / Mobility","Intellectual Disability",
  "Speech / Language","Autism Spectrum","Multiple Disabilities","Other",
];

const EDUCATION_LEVELS = [
  "No Formal Education","Primary (Class 1–8)","JSS (Form 1–3)","Secondary (Form 1–4)",
  "KCSE","Certificate","Diploma","Other",
];

const RELATIONSHIPS = ["Father","Mother","Guardian","Grandparent","Sibling","Uncle / Aunt","Spouse","Other"];

export default function CaptureLearners({ programType }: Props) {
  const { user } = useCurrentUser();
  const institutionId = user?.role !== "super_admin" ? user?.institutionId : undefined;
  const generateUploadUrl = useMutation(api.learners.generateUploadUrl);
  const captureLearner   = useMutation(api.learners.capture);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{ upi: string; name: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const schema = programType === "ecde" ? ecdeSchema : vocationalSchema;
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: { admissionDate: new Date().toISOString().split("T")[0], nationality: "Kenyan", hasDisability: "no", hasChronicIllness: "no" },
  });

  const hasDisability     = watch("hasDisability");
  const hasChronicIllness = watch("hasChronicIllness");

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Photo must be under 5 MB"); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function onSubmit(data: any) {
    if (!institutionId) { toast.error("No institution assigned to your account"); return; }
    try {
      let photoId: Id<"_storage"> | undefined;
      if (photoFile) {
        const uploadUrl = await generateUploadUrl();
        const res  = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": photoFile.type }, body: photoFile });
        const json = await res.json();
        photoId    = json.storageId;
      }
      const payload: any = {
        ...data,
        programType,
        institutionId,
        photoId,
        hasDisability:     data.hasDisability     === "yes",
        hasChronicIllness: data.hasChronicIllness === "yes",
        parent1Email: data.parent1Email || undefined,
      };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "" || payload[k] === undefined) delete payload[k];
      });
      const { upi } = await captureLearner(payload);
      setResult({ upi, name: `${data.firstName} ${data.lastName}` });
      reset({ admissionDate: new Date().toISOString().split("T")[0], nationality: "Kenyan", hasDisability: "no", hasChronicIllness: "no" });
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to capture learner");
    }
  }

  const label = programType === "ecde" ? "ECDE Learner" : "Vocational Learner";

  if (!institutionId) {
    return (
      <div className="page-container">
        <p className="text-muted-foreground text-sm">No institution assigned. Contact your administrator.</p>
      </div>
    );
  }

  /* ── Success screen ── */
  if (result) {
    return (
      <div className="page-container">
        <div className="max-w-md mx-auto text-center space-y-6 py-12">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Learner Enrolled</h2>
            <p className="text-muted-foreground text-sm mt-1">{result.name} has been successfully enrolled.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6" style={{ boxShadow: "0 1px 4px hsl(220 15% 65% / 0.10)" }}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Unique Pupil Identifier (UPI)</p>
            <p className="font-mono text-3xl font-bold text-foreground tracking-widest">{result.upi}</p>
            <p className="text-xs text-muted-foreground mt-3">
              Record this on the learner's file and admission card. It is permanent and unique.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => window.print()} className="gap-1.5">
              <Printer className="h-4 w-4" /> Print UPI Card
            </Button>
            <Button onClick={() => setResult(null)}>Enrol Another Learner</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <div className="flex items-end justify-between pb-5 border-b border-border">
        <div>
          <h1 className="section-heading">Capture {label}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {programType === "ecde"
              ? "Complete all required sections. A Unique Pupil Identifier (UPI) will be auto-generated on submission."
              : "Complete all required sections. A unique UPI will be issued on submission."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-5xl">

        {/* ── Photo ── */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-3 bg-muted/40 border-b border-border">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Passport Photo (Optional)</h3>
          </div>
          <div className="p-6 flex items-center gap-6">
            <div className="h-24 w-24 rounded-xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
              {photoPreview
                ? <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                : <Camera className="h-8 w-8 text-muted-foreground/30" />}
            </div>
            <div className="space-y-1.5">
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5">
                <Upload className="h-3.5 w-3.5" /> {photoPreview ? "Change Photo" : "Upload Photo"}
              </Button>
              <p className="text-xs text-muted-foreground">JPEG or PNG, max 5 MB. Plain background, full face.</p>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhotoChange} />
            </div>
          </div>
        </div>

        {/* ── Personal Details ── */}
        <Section title="Personal Details">
          <Field label="First Name" error={errors.firstName?.message as string} required>
            <Input {...register("firstName")} placeholder="e.g. Jane" />
          </Field>
          <Field label="Last Name (Surname)" error={errors.lastName?.message as string} required>
            <Input {...register("lastName")} placeholder="e.g. Auma" />
          </Field>
          <Field label="Other Name / Middle Name">
            <Input {...register("otherName")} placeholder="Optional" />
          </Field>
          <Field label="Gender" error={errors.gender?.message as string} required>
            <select {...register("gender")} className={SELECT_CLS}>
              <option value="">Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </Field>
          <Field label="Date of Birth" error={errors.dob?.message as string} required>
            <Input type="date" {...register("dob")} />
          </Field>
          {programType === "ecde" ? (
            <Field label="Birth Certificate No.">
              <Input {...register("birthCertNo")} placeholder="e.g. 12345678" />
            </Field>
          ) : (
            <Field label="National ID No.">
              <Input {...register("nationalId")} placeholder="e.g. 35678901" />
            </Field>
          )}
          <Field label="Nationality">
            <Input {...register("nationality")} placeholder="e.g. Kenyan" />
          </Field>
          <Field label="Religion">
            <select {...register("religion")} className={SELECT_CLS}>
              <option value="">Select</option>
              <option>Christian</option>
              <option>Muslim</option>
              <option>Hindu</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="County of Origin">
            <select {...register("county")} className={SELECT_CLS}>
              <option value="">Select county</option>
              {KENYA_COUNTIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Sub-County of Origin">
            <Input {...register("subCountyOfOrigin")} placeholder="e.g. Nambale" />
          </Field>
        </Section>

        {/* ── Enrolment / Programme Details ── */}
        <Section title={programType === "ecde" ? "Enrolment Details" : "Programme Details"}>
          {programType === "ecde" ? (
            <Field label="Class Level" error={errors.classLevel?.message as string} required>
              <select {...register("classLevel")} className={SELECT_CLS}>
                <option value="">Select class</option>
                <option value="Baby Class">Baby Class</option>
                <option value="PP1">PP1 — Pre-Primary 1</option>
                <option value="PP2">PP2 — Pre-Primary 2</option>
              </select>
            </Field>
          ) : (
            <>
              <Field label="Course / Programme" error={errors.course?.message as string} required>
                <Input {...register("course")} placeholder="e.g. Tailoring & Dressmaking" />
              </Field>
              <Field label="Intake Period" error={errors.intakePeriod?.message as string} required>
                <Input {...register("intakePeriod")} placeholder="e.g. Jan 2026" />
              </Field>
              <Field label="Year of Study">
                <select {...register("classLevel")} className={SELECT_CLS}>
                  <option value="">Select year</option>
                  <option value="Year 1">Year 1</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                </select>
              </Field>
            </>
          )}
          <Field label="Admission Date" error={errors.admissionDate?.message as string} required>
            <Input type="date" {...register("admissionDate")} />
          </Field>
          <Field label="Institution Admission No.">
            <Input {...register("admissionNo")} placeholder="e.g. 2026/001" />
          </Field>
        </Section>

        {/* ── Parent / Guardian 1 ── */}
        <Section title={programType === "ecde" ? "Parent / Guardian 1" : "Parent / Guardian"}>
          <Field label="Full Name" error={errors.parent1Name?.message as string} required={programType === "ecde"}>
            <Input {...register("parent1Name")} placeholder="e.g. John Ochieng" />
          </Field>
          <Field label="Relationship" error={errors.parent1Relationship?.message as string} required={programType === "ecde"}>
            <select {...register("parent1Relationship")} className={SELECT_CLS}>
              <option value="">Select</option>
              {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="National ID No.">
            <Input {...register("parent1IdNo")} placeholder="e.g. 12345678" />
          </Field>
          <Field label="Phone Number" error={errors.parent1Phone?.message as string} required={programType === "ecde"}>
            <Input {...register("parent1Phone")} placeholder="e.g. 0712 345 678" />
          </Field>
          <Field label="Occupation">
            <Input {...register("parent1Occupation")} placeholder="e.g. Farmer" />
          </Field>
          <Field label="Email Address">
            <Input type="email" {...register("parent1Email")} placeholder="Optional" />
          </Field>
        </Section>

        {/* ── Parent / Guardian 2 ── */}
        <Section title="Parent / Guardian 2 (Optional)" cols={2}>
          <Field label="Full Name">
            <Input {...register("parent2Name")} placeholder="e.g. Mary Auma" />
          </Field>
          <Field label="Relationship">
            <select {...register("parent2Relationship")} className={SELECT_CLS}>
              <option value="">Select</option>
              {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Phone Number">
            <Input {...register("parent2Phone")} placeholder="e.g. 0722 345 678" />
          </Field>
        </Section>

        {/* ── Next of Kin (vocational only) ── */}
        {programType === "vocational" && (
          <Section title="Next of Kin">
            <Field label="Full Name" error={errors.nextOfKinName?.message as string} required>
              <Input {...register("nextOfKinName")} placeholder="e.g. Grace Wanjiku" />
            </Field>
            <Field label="Relationship" error={errors.nextOfKinRelationship?.message as string} required>
              <select {...register("nextOfKinRelationship")} className={SELECT_CLS}>
                <option value="">Select</option>
                {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Phone Number" error={errors.nextOfKinPhone?.message as string} required>
              <Input {...register("nextOfKinPhone")} placeholder="e.g. 0700 123 456" />
            </Field>
            <Field label="Physical Address">
              <Input {...register("nextOfKinAddress")} placeholder="e.g. Funyula, Samia" />
            </Field>
          </Section>
        )}

        {/* ── Previous Education ── */}
        <Section title="Previous Education">
          {programType === "vocational" && (
            <Field label="Highest Education Level">
              <select {...register("previousEducationLevel")} className={SELECT_CLS}>
                <option value="">Select</option>
                {EDUCATION_LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
          )}
          <Field label="Previous School / Institution">
            <Input {...register("previousSchool")} placeholder="e.g. Nambale Primary School" />
          </Field>
          <Field label="Previous UPI (if transferred)">
            <Input {...register("previousUpi")} placeholder="e.g. B-NMB-00001" className="font-mono" />
          </Field>
        </Section>

        {/* ── Health & Special Needs ── */}
        <Section title="Health & Special Needs" cols={2}>
          <Field label="Does the learner have a disability?">
            <select {...register("hasDisability")} className={SELECT_CLS}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </Field>
          {hasDisability === "yes" && (
            <Field label="Type of Disability">
              <select {...register("disabilityType")} className={SELECT_CLS}>
                <option value="">Select</option>
                {DISABILITY_TYPES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
          )}
          <Field label="Does the learner have a chronic illness?">
            <select {...register("hasChronicIllness")} className={SELECT_CLS}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </Field>
          {hasChronicIllness === "yes" && (
            <Field label="Illness Details">
              <Input {...register("chronicIllnessDetails")} placeholder="e.g. Asthma, Epilepsy" />
            </Field>
          )}
        </Section>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Fields marked <span className="text-destructive">*</span> are required</p>
          <Button type="submit" disabled={isSubmitting} className="px-8">
            {isSubmitting ? "Enrolling…" : `Enrol ${label}`}
          </Button>
        </div>
      </form>
    </div>
  );
}
