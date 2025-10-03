import { useState } from "react";
import { Shield, Building2, User, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function InitialSetup() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Super Admin Creation
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminName, setAdminName] = useState("");

  // Institution Creation
  const [institutionName, setInstitutionName] = useState("");
  const [institutionType, setInstitutionType] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");

  const handleCreateSuperAdmin = async () => {
    try {
      setIsLoading(true);

      // First, create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            full_name: adminName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed");

      // Then assign super_admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'super_admin',
        });

      if (roleError) throw roleError;

      toast({
        title: "Super Admin Created",
        description: `Admin account created for ${adminEmail}. Please verify the email.`,
      });

      setStep(2);
    } catch (error: any) {
      console.error('Error creating super admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create super admin",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInstitution = async () => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('institutions')
        .insert({
          name: institutionName,
          type: institutionType,
          registration_no: registrationNo,
          county: 'Busia',
        });

      if (error) throw error;

      toast({
        title: "Institution Created",
        description: `${institutionName} has been successfully created.`,
      });

      setStep(3);
    } catch (error: any) {
      console.error('Error creating institution:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create institution",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-muted'}`}>
              1
            </div>
            <span className="text-sm font-medium">Super Admin</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-muted'}`}>
              2
            </div>
            <span className="text-sm font-medium">Institution</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-muted'}`}>
              3
            </div>
            <span className="text-sm font-medium">Complete</span>
          </div>
        </div>

        {/* Step 1: Create Super Admin */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>Create Super Admin Account</CardTitle>
              </div>
              <CardDescription>
                This account will have full access to manage all institutions and users in the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminName">Full Name</Label>
                <Input
                  id="adminName"
                  placeholder="John Doe"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email Address</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@example.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>
              <Button
                onClick={handleCreateSuperAdmin}
                disabled={isLoading || !adminEmail || !adminPassword || !adminName}
                className="w-full"
              >
                {isLoading ? "Creating..." : "Create Super Admin"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Create First Institution */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <CardTitle>Create First Institution</CardTitle>
              </div>
              <CardDescription>
                Add your first ECDE or Vocational training institution to the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="institutionName">Institution Name</Label>
                <Input
                  id="institutionName"
                  placeholder="Busia Technical Institute"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institutionType">Institution Type</Label>
                <select
                  id="institutionType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={institutionType}
                  onChange={(e) => setInstitutionType(e.target.value)}
                  required
                >
                  <option value="">Select type...</option>
                  <option value="ECDE">ECDE (Early Childhood Development)</option>
                  <option value="Vocational">Vocational Training Center</option>
                  <option value="Both">Both ECDE & Vocational</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNo">Registration Number</Label>
                <Input
                  id="registrationNo"
                  placeholder="REG-2024-001"
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleCreateInstitution}
                  disabled={isLoading || !institutionName || !institutionType}
                  className="flex-1"
                >
                  {isLoading ? "Creating..." : "Create Institution"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Setup Complete */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-6 w-6 text-success" />
                <CardTitle>Setup Complete!</CardTitle>
              </div>
              <CardDescription>
                Your ECDEAVOTMIS system is ready to use.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <h3 className="font-semibold text-success mb-2">What's Next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Check your email to verify the super admin account</li>
                  <li>• Log in with your super admin credentials</li>
                  <li>• Assign the institution to users</li>
                  <li>• Create additional users with appropriate roles</li>
                  <li>• Start capturing learner and student data</li>
                </ul>
              </div>
              <Button
                onClick={() => window.location.href = '/auth'}
                className="w-full"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Text */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              Need help? Contact your system administrator or refer to the setup documentation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
