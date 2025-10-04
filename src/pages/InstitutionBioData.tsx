import { useState, useEffect } from "react";
import { Building2, MapPin, FileText, Upload, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export default function InstitutionBioData() {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    institutionType: "",
    institutionLevel: "",
    county: "",
    subCounty: "",
    ward: "",
    zone: "",
    educationSystem: "",
    kraPin: "",
    registrationNumber: "",
    category: "",
    latitude: "",
    longitude: "",
    ownership: "",
    sbpCompliance: false,
    nearestHealthFacility: "",
    nearestPoliceStation: "",
    ownershipDocument: null as File | null,
  });

  useEffect(() => {
    if (!profile?.institution_id) return;

    const fetchInstitution = async () => {
      try {
        const { data, error } = await supabase
          .from('institutions')
          .select('*')
          .eq('id', profile.institution_id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            institutionType: data.type || "",
            institutionLevel: data.level || "",
            county: data.county || "",
            subCounty: data.subcounty || "",
            ward: data.ward || "",
            zone: data.zone || "",
            educationSystem: data.education_system || "",
            kraPin: data.kra_pin || "",
            registrationNumber: data.registration_no || "",
            category: data.category || "",
            latitude: data.geo_lat || "",
            longitude: data.geo_lng || "",
            ownership: data.ownership || "",
            sbpCompliance: data.sbp_compliance || false,
            nearestHealthFacility: data.nearest_health || "",
            nearestPoliceStation: data.nearest_police || "",
            ownershipDocument: null,
          });
        }
      } catch (error: any) {
        console.error('Error fetching institution:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitution();
  }, [profile?.institution_id]);

  const handleInputChange = (field: string, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.institution_id) {
      toast({
        title: "Error",
        description: "Institution not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      let ownershipDocPath = null;
      if (formData.ownershipDocument) {
        const fileExt = formData.ownershipDocument.name.split('.').pop();
        const fileName = `${profile.institution_id}_ownership_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, formData.ownershipDocument);

        if (uploadError) throw uploadError;
        ownershipDocPath = uploadData.path;
      }

      const { error } = await supabase
        .from('institutions')
        .update({
          type: formData.institutionType,
          level: formData.institutionLevel,
          county: formData.county,
          subcounty: formData.subCounty,
          ward: formData.ward,
          zone: formData.zone,
          education_system: formData.educationSystem,
          kra_pin: formData.kraPin,
          registration_no: formData.registrationNumber,
          category: formData.category,
          geo_lat: formData.latitude,
          geo_lng: formData.longitude,
          ownership: formData.ownership,
          sbp_compliance: formData.sbpCompliance,
          nearest_health: formData.nearestHealthFacility,
          nearest_police: formData.nearestPoliceStation,
          ...(ownershipDocPath && { ownership_doc: ownershipDocPath }),
        })
        .eq('id', profile.institution_id);

      if (error) throw error;

      toast({
        title: "Institution Bio-data Updated",
        description: "Your institution information has been successfully saved.",
      });
    } catch (error: any) {
      console.error('Error updating institution:', error);
      toast({
        title: "Error",
        description: "Failed to save institution bio-data",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading institution data...</p>
      </div>
    );
  }

  const counties = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu", "Kiambu", "Machakos", "Kajiado"
  ];

  const institutionTypes = [
    "Public Primary School", "Private Primary School", "Public Secondary School", 
    "Private Secondary School", "ECDE Center", "Vocational Training Institute"
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />
          Institution Bio-data
        </h1>
        <p className="text-muted-foreground">
          Manage your institution's basic information and registration details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Provide essential details about your educational institution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institutionType">Institution Type *</Label>
                <Select onValueChange={(value) => handleInputChange("institutionType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution type" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutionTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institutionLevel">Institution Level *</Label>
                <Select onValueChange={(value) => handleInputChange("institutionLevel", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="ecde">ECDE</SelectItem>
                    <SelectItem value="vocational">Vocational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="educationSystem">Education System *</Label>
                <Select onValueChange={(value) => handleInputChange("educationSystem", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select education system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8-4-4">8-4-4 System</SelectItem>
                    <SelectItem value="cbc">Competency Based Curriculum (CBC)</SelectItem>
                    <SelectItem value="igcse">IGCSE</SelectItem>
                    <SelectItem value="ib">International Baccalaureate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">National School</SelectItem>
                    <SelectItem value="extra-county">Extra County</SelectItem>
                    <SelectItem value="county">County School</SelectItem>
                    <SelectItem value="sub-county">Sub County School</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kraPin">KRA PIN</Label>
                <Input
                  id="kraPin"
                  placeholder="Enter KRA PIN"
                  value={formData.kraPin}
                  onChange={(e) => handleInputChange("kraPin", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number *</Label>
                <Input
                  id="registrationNumber"
                  placeholder="Enter registration number"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location Information
            </CardTitle>
            <CardDescription>
              Specify the geographical location and administrative details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="county">County *</Label>
                <Select onValueChange={(value) => handleInputChange("county", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {counties.map((county) => (
                      <SelectItem key={county} value={county}>{county}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subCounty">Sub County *</Label>
                <Input
                  id="subCounty"
                  placeholder="Enter sub county"
                  value={formData.subCounty}
                  onChange={(e) => handleInputChange("subCounty", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ward">Ward *</Label>
                <Input
                  id="ward"
                  placeholder="Enter ward"
                  value={formData.ward}
                  onChange={(e) => handleInputChange("ward", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone">Zone</Label>
                <Input
                  id="zone"
                  placeholder="Enter zone (optional)"
                  value={formData.zone}
                  onChange={(e) => handleInputChange("zone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  placeholder="e.g., -1.286389"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange("latitude", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  placeholder="e.g., 36.817223"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange("longitude", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nearestHealthFacility">Nearest Health Facility</Label>
                <Input
                  id="nearestHealthFacility"
                  placeholder="Name of nearest health facility"
                  value={formData.nearestHealthFacility}
                  onChange={(e) => handleInputChange("nearestHealthFacility", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nearestPoliceStation">Nearest Police Station</Label>
                <Input
                  id="nearestPoliceStation"
                  placeholder="Name of nearest police station"
                  value={formData.nearestPoliceStation}
                  onChange={(e) => handleInputChange("nearestPoliceStation", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ownership & Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Ownership & Compliance
            </CardTitle>
            <CardDescription>
              Ownership details and regulatory compliance information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ownership">Ownership Type *</Label>
              <Select onValueChange={(value) => handleInputChange("ownership", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ownership type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="faith-based">Faith-Based</SelectItem>
                  <SelectItem value="ngo">NGO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sbpCompliance"
                checked={formData.sbpCompliance}
                onCheckedChange={(checked) => handleInputChange("sbpCompliance", checked as boolean)}
              />
              <Label htmlFor="sbpCompliance">
                SBP Compliance (School-Based Program compliance for private institutions)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownershipDocument">Ownership Document</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="ownershipDocument"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleInputChange("ownershipDocument", e.target.files?.[0] || null)}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary-hover"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Upload certificate of registration, title deed, or other ownership documents (PDF, DOC, DOCX)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" className="bg-gradient-primary hover:opacity-90" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Institution Bio-data"}
          </Button>
        </div>
      </form>
    </div>
  );
}