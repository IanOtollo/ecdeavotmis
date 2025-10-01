import { useState } from "react";
import { UserPlus, Upload, Calendar, User, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export default function CaptureLearners() {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    otherName: "",
    gender: "",
    dateOfBirth: "",
    admissionDate: "",
    photo: null as File | null,
    learnerType: "ecde", // ecde or vocational
  });

  // Generate UPI with Busia format: B-[Institution]-[Number]
  const generateUPI = () => {
    const institutionCode = "T"; // T for Technical Institute
    const randomNumber = Math.floor(Math.random() * 999) + 1;
    return `B${institutionCode}${randomNumber.toString().padStart(3, '0')}`;
  };

  const [generatedUPI] = useState(generateUPI());

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.gender || !formData.dateOfBirth) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields marked with *",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.institution_id) {
      toast({
        title: "Error",
        description: "You must be assigned to an institution to register learners",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl = null;

      // Upload photo if provided
      if (formData.photo) {
        const fileExt = formData.photo.name.split('.').pop();
        const fileName = `${generatedUPI}.${fileExt}`;
        const filePath = `${profile.institution_id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('learner-photos')
          .upload(filePath, formData.photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('learner-photos')
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      // Determine which table to insert into
      const table = formData.learnerType === "ecde" ? "learners" : "students";

      // Insert learner/student data
      const { error: insertError } = await supabase
        .from(table)
        .insert({
          upi: generatedUPI,
          first_name: formData.firstName,
          last_name: formData.lastName,
          other_name: formData.otherName || null,
          gender: formData.gender,
          dob: formData.dateOfBirth,
          admission_date: formData.admissionDate || new Date().toISOString().split('T')[0],
          photo: photoUrl,
          institution_id: profile.institution_id,
          status: 'enrolled'
        });

      if (insertError) throw insertError;

      toast({
        title: "Success!",
        description: `${formData.firstName} ${formData.lastName} registered with UPI: ${generatedUPI}`,
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        otherName: "",
        gender: "",
        dateOfBirth: "",
        admissionDate: "",
        photo: null,
        learnerType: "ecde",
      });

      // Reload to generate new UPI
      window.location.reload();

    } catch (error: any) {
      console.error('Error registering learner:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to register learner",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <UserPlus className="h-8 w-8 text-primary" />
          Capture Learners
        </h1>
        <p className="text-muted-foreground">
          Register new learners in ECDE (Early Childhood Development Education) or Vocational Training programs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Learner Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Learner Type</CardTitle>
                <CardDescription>
                  Select the type of program the learner will be enrolled in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={formData.learnerType === "ecde" ? "default" : "outline"}
                    onClick={() => handleInputChange("learnerType", "ecde")}
                    className="flex-1"
                  >
                    ECDE Learner
                  </Button>
                  <Button
                    type="button"
                    variant={formData.learnerType === "vocational" ? "default" : "outline"}
                    onClick={() => handleInputChange("learnerType", "vocational")}
                    className="flex-1"
                  >
                    Vocational Student
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Provide the learner's basic personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otherName">Other Name</Label>
                    <Input
                      id="otherName"
                      placeholder="Enter other name (optional)"
                      value={formData.otherName}
                      onChange={(e) => handleInputChange("otherName", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select onValueChange={(value) => handleInputChange("gender", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admissionDate">Admission Date</Label>
                    <Input
                      id="admissionDate"
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => handleInputChange("admissionDate", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Photo Upload
                </CardTitle>
                <CardDescription>
                  Upload a recent photograph of the learner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="photo">Learner Photo</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleInputChange("photo", e.target.files?.[0] || null)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary-hover"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a clear, recent photograph (JPG, PNG, GIF - Max 5MB)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-gradient-primary hover:opacity-90"
                disabled={isSubmitting || !profile?.institution_id}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Registering...' : `Register ${formData.learnerType === "ecde" ? "Learner" : "Student"}`}
              </Button>
            </div>
          </form>
        </div>

        {/* UPI Information */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="text-primary">
                  UPI
                </Badge>
                Unique Personal Identifier
              </CardTitle>
              <CardDescription>
                Auto-generated unique identifier for the learner
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary-light rounded-lg border-2 border-dashed border-primary">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Generated UPI</p>
                  <p className="text-lg font-mono font-bold text-primary">{generatedUPI}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p>Each learner receives a unique UPI upon registration</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p>UPI is used for tracking and reporting across the system</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p>This identifier remains with the learner throughout their educational journey</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Program Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Program Type:</span>
                  <Badge variant={formData.learnerType === "ecde" ? "default" : "secondary"}>
                    {formData.learnerType === "ecde" ? "ECDE" : "Vocational"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="status-pending">
                    Pending Registration
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}