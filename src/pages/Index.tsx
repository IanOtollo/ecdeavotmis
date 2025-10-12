import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSetup = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate("/auth");
        setChecking(false);
        return;
      }

      try {
        // Check if user has a profile with institution
        const { data: profile } = await supabase
          .from('profiles')
          .select('institution_id')
          .eq('id', user.id)
          .maybeSingle();

        // Check if user has roles
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        // If no profile or no institution, redirect to setup
        if (!profile || !profile.institution_id || !roles || roles.length === 0) {
          navigate("/setup");
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error('Error checking setup:', error);
        navigate("/dashboard");
      } finally {
        setChecking(false);
      }
    };

    checkSetup();
  }, [user, authLoading, navigate]);

  if (checking || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="mb-4 text-4xl font-bold">Welcome to ECDEAVOTMIS</h1>
          <div className="space-y-2">
            <Skeleton className="h-4 w-64 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
