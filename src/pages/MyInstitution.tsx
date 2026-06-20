import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRef, useState } from "react";
import {
  Building2, Users, BookOpen, AlertTriangle, Landmark, Database,
  CheckCircle2, XCircle, Upload, ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

function Field({ label, value, mono }: { label: string; value?: string | number | boolean | null; mono?: boolean }) {
  if (value === undefined || value === null || value === "") return null;
  const displayValue = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-0.5">{label}</p>
      <p className={`text-sm font-medium text-foreground ${mono ? "font-mono" : ""}`}>{displayValue}</p>
    </div>
  );
}

function LogoUploader({ institutionId, currentLogoUrl }: { institutionId: Id<"institutions">; currentLogoUrl: string | null | undefined }) {
  const generateUploadUrl = useMutation(api.institutions.generateLogoUploadUrl);
  const updateInstitution = useMutation(api.institutions.update);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2 MB"); return; }

    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();
      await updateInstitution({ institutionId, logoStorageId: storageId });
      toast.success("School logo uploaded successfully");
      setPreview(null);
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const displaySrc = preview ?? currentLogoUrl;

  return (
    <div className="flex items-center gap-5 flex-wrap">
      {/* Logo preview */}
      <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
        {uploading ? (
          <div className="h-full w-full animate-pulse bg-muted rounded-2xl" />
        ) : displaySrc ? (
          <img src={displaySrc} alt="School logo" className="h-full w-full object-contain p-1" />
        ) : (
          <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
        )}
      </div>

      {/* Upload controls */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">School / Institution Logo</p>
        <p className="text-xs text-muted-foreground">
          Upload your institution's official logo. This replaces the Busia County emblem<br />
          in the sidebar. PNG or JPG, max 2 MB. Recommended: square format (200×200px).
        </p>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? "Uploading…" : currentLogoUrl ? "Change Logo" : "Upload Logo"}
        </Button>
      </div>
    </div>
  );
}

export default function MyInstitution() {
  const { user } = useCurrentUser();
  const institutionId = user?.institutionId;

  const institution   = useQuery(api.institutions.getById, institutionId ? { institutionId: institutionId as Id<"institutions"> } : "skip");
  const logoUrl       = useQuery(api.institutions.getLogoUrl, institutionId ? { institutionId: institutionId as Id<"institutions"> } : "skip");
  const learners      = useQuery(api.learners.list,       institutionId ? { institutionId: institutionId as Id<"institutions"> } : "skip");
  const teachers      = useQuery(api.teachers.list,       institutionId ? { institutionId: institutionId as Id<"institutions"> } : "skip");
  const bankAccounts  = useQuery(api.bankAccounts.list,   institutionId ? { institutionId: institutionId as Id<"institutions"> } : "skip");
  const infrastructure = useQuery(api.infrastructure.list, institutionId ? { institutionId: institutionId as Id<"institutions"> } : "skip");
  const books         = useQuery(api.books.list,          institutionId ? { institutionId: institutionId as Id<"institutions"> } : "skip");
  const emergencies   = useQuery(api.emergencies.list,    institutionId ? { institutionId: institutionId as Id<"institutions"> } : "skip");

  if (!institutionId) {
    return <div className="page-container"><p className="text-muted-foreground text-sm">You are not assigned to an institution.</p></div>;
  }
  if (institution === undefined) {
    return <div className="page-container space-y-4 animate-pulse">{[...Array(3)].map((_,i)=><div key={i} className="h-24 bg-muted rounded-xl"/>)}</div>;
  }
  if (!institution) {
    return <div className="page-container"><p className="text-muted-foreground">Institution not found.</p></div>;
  }

  const isVT = institution.type === "Vocational Training";
  const activeLearners = (learners ?? []).filter(l => l.status === "active");
  const males   = activeLearners.filter(l => l.gender === "male").length;
  const females = activeLearners.filter(l => l.gender === "female").length;
  const openEmergencies = (emergencies ?? []).filter(e => e.status === "open").length;
  const infraNeedRepair = (infrastructure ?? []).filter(i => ["Poor","Needs Urgent Repair","Condemned"].includes(i.condition)).length;

  const statCards = [
    { icon: Users,      label: isVT ? "VT Learners" : "ECDE Learners", value: activeLearners.length, sub: `${males}M · ${females}F`, color: "" },
    { icon: Users,      label: "Teaching Staff",     value: teachers?.length ?? "—",       sub: "",                                    color: "" },
    { icon: Database,   label: "Infrastructure",      value: infrastructure?.length ?? "—", sub: infraNeedRepair > 0 ? `${infraNeedRepair} need repair` : "All ok", color: infraNeedRepair > 0 ? "text-orange-600" : "" },
    { icon: BookOpen,   label: "Book Titles",         value: books?.length ?? "—",          sub: `${(books??[]).reduce((s,b)=>s+b.quantity,0)} copies`, color: "" },
    { icon: Landmark,   label: "Bank Accounts",       value: bankAccounts?.length ?? "—",   sub: "",                                    color: "" },
    { icon: AlertTriangle, label: "Open Incidents",   value: openEmergencies,               sub: "",                                    color: openEmergencies > 0 ? "text-red-600" : "" },
  ];

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6 flex items-start gap-5 flex-wrap">
        {/* Logo area */}
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt={institution.name} className="h-full w-full object-contain p-1" />
          ) : (
            <Building2 className="h-8 w-8 text-[#C8A96E]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="section-heading">{institution.name}</h1>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${institution.status === "active" || !institution.status ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
              {institution.status ?? "Active"}
            </span>
            {institution.sbpCompliance !== undefined && (
              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${institution.sbpCompliance ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
                {institution.sbpCompliance ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                SBP {institution.sbpCompliance ? "Compliant" : "Non-Compliant"}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{institution.type} · {institution.subcounty} Sub-county, {institution.county} County</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
            <span>Code: <span className="font-mono text-foreground font-semibold">{institution.uniqueCode}</span></span>
            {institution.registrationNo && <span>Reg: <span className="font-mono text-foreground">{institution.registrationNo}</span></span>}
            {institution.ward && <span>Ward: {institution.ward}</span>}
            {institution.zone && <span>Zone: {institution.zone}</span>}
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <Icon className="h-4 w-4 text-muted-foreground mb-2" />
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
            {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Logo Upload */}
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">School Logo</p>
        <LogoUploader
          institutionId={institutionId as Id<"institutions">}
          currentLogoUrl={logoUrl}
        />
      </div>

      {/* Details panels */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Location</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <Field label="County" value={institution.county} />
            <Field label="Sub-county" value={institution.subcounty} />
            <Field label="Ward" value={institution.ward} />
            <Field label="Zone" value={institution.zone} />
            <Field label="Location" value={institution.location} />
            {institution.geoLat && <Field label="GPS Coordinates" value={`${institution.geoLat}, ${institution.geoLng}`} mono />}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Registration</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <Field label="Reg. No." value={institution.registrationNo} mono />
            <Field label="Reg. Date" value={institution.registrationDate} />
            <Field label="KRA PIN" value={institution.kraPin} mono />
            <Field label="Ownership" value={institution.ownership} />
            <Field label="Level" value={institution.level} />
            <Field label="Education System" value={institution.educationSystem} />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nearest Facilities</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <Field label="Nearest Town" value={institution.nearestTown} />
            <Field label="Nearest Police" value={institution.nearestPolice} />
            <Field label="Nearest Health" value={institution.nearestHealth} />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Learner Breakdown</p>
          {activeLearners.length === 0 ? (
            <p className="text-sm text-muted-foreground">No learners captured yet</p>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm border-b border-border/50 pb-2">
                <span className="text-muted-foreground font-medium">Active total</span>
                <span className="font-bold">{activeLearners.length}</span>
              </div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Male</span><span className="font-medium">{males}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Female</span><span className="font-medium">{females}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">With disability</span><span className="font-medium">{activeLearners.filter(l=>l.hasDisability).length}</span></div>
              {(()=>{
                const groups = [...new Set(activeLearners.map(l=>l.classLevel).filter(Boolean))].sort().map(c=>({name:c!,count:activeLearners.filter(l=>l.classLevel===c).length}));
                return groups.length > 0 ? (
                  <div className="pt-2 border-t border-border/50 space-y-1.5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{isVT?"By Year / Level":"By Class"}</p>
                    {groups.map(g=>(
                      <div key={g.name} className="flex justify-between text-sm"><span className="text-muted-foreground">{g.name}</span><span className="font-medium">{g.count}</span></div>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
