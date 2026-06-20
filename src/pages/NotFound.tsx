import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p
        className="text-8xl font-bold text-muted-foreground/15 mb-4"
        style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
      >
        404
      </p>
      <h1
        className="text-2xl font-semibold text-foreground mb-2"
        style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
      >
        Page not found
      </h1>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm">
        The page you are looking for does not exist or you do not have permission to view it.
      </p>
      <Button onClick={() => navigate("/dashboard")} className="gap-2">
        <Home className="h-4 w-4" /> Return to Dashboard
      </Button>
    </div>
  );
}
