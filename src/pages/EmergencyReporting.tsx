import { useState } from "react";
import { AlertTriangle, Save, Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export default function EmergencyReporting() {
  const { toast } = useToast();
  const { profile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    emergencyType: "",
    dateOccurred: "",
    timeOccurred: "",
    location: "",
    description: "",
    severity: "",
    injuries: "",
    damageAssessment: "",
    responseActions: "",
    status: "reported",
  });

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
        .from('emergencies')
        .insert({
          institution_id: profile.institution_id,
          calamity_name: formData.emergencyType,
          reporting_date: formData.dateOccurred,
          description: `${formData.description}\n\nLocation: ${formData.location}\nSeverity: ${formData.severity}\nInjuries: ${formData.injuries}\nDamage: ${formData.damageAssessment}\nResponse: ${formData.responseActions}`,
          status: 'reported',
        });

      if (error) throw error;

      toast({
        title: "Emergency Report Submitted",
        description: "Your emergency report has been successfully recorded.",
      });

      setFormData({
        emergencyType: "",
        dateOccurred: "",
        timeOccurred: "",
        location: "",
        description: "",
        severity: "",
        injuries: "",
        damageAssessment: "",
        responseActions: "",
        status: "reported",
      });
    } catch (error: any) {
      console.error('Error submitting emergency report:', error);
      toast({
        title: "Error",
        description: "Failed to submit emergency report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const emergencyTypes = [
    "Fire", "Flood", "Earthquake", "Storm Damage", "Building Collapse", 
    "Health Emergency", "Security Incident", "Vandalism", "Other"
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-warning" />
          Emergency Reporting
        </h1>
        <p className="text-muted-foreground">
          Report and manage emergency incidents and calamities affecting the institution
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Emergency Incident Details</CardTitle>
            <CardDescription>
              Provide detailed information about the emergency or calamity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyType">Emergency Type *</Label>
                <Select onValueChange={(value) => handleInputChange("emergencyType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select emergency type" />
                  </SelectTrigger>
                  <SelectContent>
                    {emergencyTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity Level *</Label>
                <Select onValueChange={(value) => handleInputChange("severity", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOccurred">Date Occurred *</Label>
                <Input
                  id="dateOccurred"
                  type="date"
                  value={formData.dateOccurred}
                  onChange={(e) => handleInputChange("dateOccurred", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeOccurred">Time Occurred</Label>
                <Input
                  id="timeOccurred"
                  type="time"
                  value={formData.timeOccurred}
                  onChange={(e) => handleInputChange("timeOccurred", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location/Area Affected *</Label>
              <Input
                id="location"
                placeholder="Describe the specific location within the institution"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Incident Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of what happened"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="injuries">Injuries/Casualties</Label>
              <Textarea
                id="injuries"
                placeholder="Report any injuries or casualties (if none, write 'None')"
                value={formData.injuries}
                onChange={(e) => handleInputChange("injuries", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="damageAssessment">Damage Assessment</Label>
              <Textarea
                id="damageAssessment"
                placeholder="Describe property damage, estimated costs, affected infrastructure"
                value={formData.damageAssessment}
                onChange={(e) => handleInputChange("damageAssessment", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responseActions">Response Actions Taken</Label>
              <Textarea
                id="responseActions"
                placeholder="Describe immediate response actions and measures taken"
                value={formData.responseActions}
                onChange={(e) => handleInputChange("responseActions", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="bg-gradient-primary hover:opacity-90" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit Emergency Report"}
          </Button>
        </div>
      </form>
    </div>
  );
}