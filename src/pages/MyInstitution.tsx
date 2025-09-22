import { useState } from "react";
import { Building2, MapPin, Phone, Mail, Calendar, Users, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function MyInstitution() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    institutionName: "Busia Technical Institute",
    institutionCode: "BTI001",
    institutionType: "technical",
    registrationNumber: "REG/BTI/2020/001",
    establishedDate: "2020-01-15",
    address: "123 Main Street, Busia County",
    county: "busia",
    subCounty: "busia-central",
    ward: "busia-ward-1",
    phone: "+254700000000",
    email: "info@busiatech.ac.ke",
    website: "www.busiatech.ac.ke",
    principalName: "Dr. Jane Doe",
    totalStudents: "450",
    totalStaff: "35",
    description: "Leading technical institute providing quality vocational training and early childhood development education."
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Institution Profile Updated",
      description: "Your institution information has been successfully updated.",
    });
  };

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
          <Button type="submit" className="bg-gradient-primary hover:opacity-90">
            <Save className="h-4 w-4 mr-2" />
            Update Institution Profile
          </Button>
        </div>
      </form>
    </div>
  );
}