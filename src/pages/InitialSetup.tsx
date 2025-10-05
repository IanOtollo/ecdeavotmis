import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function InitialSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Institution fields
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState('ECDE');
  const [institutionLevel, setInstitutionLevel] = useState('ECDE');
  const [registrationNo, setRegistrationNo] = useState('');

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleCreateInstitutionAndAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create an institution',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create the institution
      const { data: institution, error: institutionError } = await supabase
        .from('institutions')
        .insert({
          name: institutionName,
          type: institutionType,
          level: institutionLevel,
          registration_no: registrationNo,
          county: 'Busia',
        })
        .select()
        .single();

      if (institutionError) throw institutionError;

      // Update user profile with institution_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ institution_id: institution.id })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Check if user already has roles
      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      // If no roles, assign institution_admin role
      if (!existingRoles || existingRoles.length === 0) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'institution_admin',
          });

        if (roleError) throw roleError;
      }

      toast({
        title: 'Success',
        description: 'Institution created and assigned successfully!',
      });

      setStep(2);
    } catch (error: any) {
      console.error('Error creating institution:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create institution',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <img 
            src="/src/assets/busia-county-logo.png" 
            alt="Busia County" 
            className="h-20 mx-auto mb-4"
          />
          <CardTitle className="text-2xl">ECDEAVOTMIS Setup</CardTitle>
          <CardDescription>
            Complete your setup by creating your institution profile
          </CardDescription>
          
          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            <div className={`h-2 w-32 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
            <div className={`h-2 w-32 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Create Institution */}
          {step === 1 && (
            <form onSubmit={handleCreateInstitutionAndAssign} className="space-y-4">
              <div className="text-center mb-6">
                <Building2 className="h-12 w-12 text-primary mx-auto mb-2" />
                <h3 className="text-xl font-semibold">Create Your Institution</h3>
                <p className="text-sm text-muted-foreground">Set up your school or training center</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution-name">Institution Name *</Label>
                <Input
                  id="institution-name"
                  type="text"
                  placeholder="Example ECDE Center / Vocational Institute"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution-type">Institution Type *</Label>
                <Select value={institutionType} onValueChange={setInstitutionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ECDE">ECDE Center</SelectItem>
                    <SelectItem value="Vocational">Vocational Training Center</SelectItem>
                    <SelectItem value="Both">ECDE & Vocational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution-level">Institution Level *</Label>
                <Select value={institutionLevel} onValueChange={setInstitutionLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ECDE">ECDE</SelectItem>
                    <SelectItem value="Vocational">Vocational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration-no">Registration Number *</Label>
                <Input
                  id="registration-no"
                  type="text"
                  placeholder="REG123456"
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Institution...' : 'Create Institution & Continue'}
              </Button>
            </form>
          )}

          {/* Step 2: Complete */}
          {step === 2 && (
            <div className="text-center space-y-4 py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-2xl font-semibold">Setup Complete!</h3>
              <p className="text-muted-foreground">
                Your institution has been created successfully. You can now access the dashboard and start managing your data.
              </p>
              <Button onClick={() => navigate('/dashboard')} className="w-full mt-4">
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
