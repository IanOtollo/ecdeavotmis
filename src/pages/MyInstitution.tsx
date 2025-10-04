import { useState, useEffect } from "react";
import { Building2, MapPin, Phone, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export default function MyInstitution() {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    institutionName: "",
    institutionCode: "",
    institutionType: "",
    registrationNumber: "",
    establishedDate: "",
    address: "",
    county: "",
    subCounty: "",
    ward: "",
    phone: "",
    email: "",
    website: "",
    principalName: "",
    totalStudents: "",
    totalStaff: "",
    description: ""
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
            institutionName: data.name || "",
            institutionCode: data.unique_code || "",
            institutionType: data.type || "",
            registrationNumber: data.registration_no || "",
            establishedDate: data.registration_date || "",
            address: `${data.location || ""}, ${data.ward || ""}`,
            county: data.county || "",
            subCounty: data.subcounty || "",
            ward: data.ward || "",
            phone: "",
            email: "",
            website: "",
            principalName: "",
            totalStudents: "",
            totalStaff: "",
            description: ""
          });
        }
      } catch (error: any) {
        console.error('Error fetching institution:', error);
        toast({
          title: "Error",
          description: "Failed to load institution data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInstitution();
  }, [profile?.institution_id, toast]);

  const handleInputChange = (field: string, value: string) => {
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
      const { error } = await supabase
        .from('institutions')
        .update({
          name: formData.institutionName,
          unique_code: formData.institutionCode,
          type: formData.institutionType,
          registration_no: formData.registrationNumber,
          registration_date: formData.establishedDate,
          county: formData.county,
          subcounty: formData.subCounty,
          ward: formData.ward,
        })
        .eq('id', profile.institution_id);

      if (error) throw error;

      toast({
        title: "Institution Profile Updated",
        description: "Your institution information has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Error updating institution:', error);
      toast({
        title: "Error",
        description: "Failed to update institution",
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />
          My Institution
        </h1>
        <p className="text-muted-foreground">
          Manage your institution's profile and contact information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core details about your institution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institutionName">Institution Name</Label>
                <Input
                  id="institutionName"
                  value={formData.institutionName}
                  onChange={(e) => handleInputChange("institutionName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institutionCode">Institution Code</Label>
                <Input
                  id="institutionCode"
                  value={formData.institutionCode}
                  onChange={(e) => handleInputChange("institutionCode", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institutionType">Institution Type</Label>
                <Select onValueChange={(value) => handleInputChange("institutionType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Institute</SelectItem>
                    <SelectItem value="ecde">ECDE Center</SelectItem>
                    <SelectItem value="vocational">Vocational Training Center</SelectItem>
                    <SelectItem value="polytechnic">Polytechnic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Physical Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Select onValueChange={(value) => handleInputChange("county", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="busia">Busia</SelectItem>
                    <SelectItem value="nairobi">Nairobi</SelectItem>
                    <SelectItem value="mombasa">Mombasa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subCounty">Sub County</Label>
                <Input
                  id="subCounty"
                  value={formData.subCounty}
                  onChange={(e) => handleInputChange("subCounty", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ward">Ward</Label>
                <Input
                  id="ward"
                  value={formData.ward}
                  onChange={(e) => handleInputChange("ward", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="principalName">Principal/Head Name</Label>
                <Input
                  id="principalName"
                  value={formData.principalName}
                  onChange={(e) => handleInputChange("principalName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalStudents">Total Students</Label>
                <Input
                  id="totalStudents"
                  type="number"
                  value={formData.totalStudents}
                  onChange={(e) => handleInputChange("totalStudents", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalStaff">Total Staff</Label>
                <Input
                  id="totalStaff"
                  type="number"
                  value={formData.totalStaff}
                  onChange={(e) => handleInputChange("totalStaff", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Institution Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="bg-gradient-primary hover:opacity-90" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Updating..." : "Update Institution Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}