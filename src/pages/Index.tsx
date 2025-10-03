import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to ECDEAVOTMIS</h1>
        <p className="text-xl text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default Index;
