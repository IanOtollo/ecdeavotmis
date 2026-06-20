import { useConvexAuth } from "convex/react";
import { Navigate } from "react-router-dom";

function AppShellSkeleton() {
  return (
    <div className="min-h-screen flex bg-background animate-pulse">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 shrink-0" style={{ background: "hsl(218 55% 13%)" }}>
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white/10 shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-2.5 w-24 rounded bg-white/10" />
            <div className="h-2 w-16 rounded bg-white/8" />
          </div>
        </div>
        <div className="p-3 space-y-1 pt-4">
          <div className="h-3 w-20 rounded bg-white/10 mb-3 ml-2" />
          {[80, 65, 75, 60, 70, 55, 65].map((w, i) => (
            <div key={i} className="h-9 rounded-lg bg-white/6" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-border bg-card/80 flex items-center px-4 sm:px-6 gap-3 shrink-0">
          <div className="h-7 w-7 rounded-md bg-muted shrink-0" />
          <div className="h-4 w-36 rounded bg-muted hidden sm:block" />
          <div className="flex-1" />
          <div className="h-7 w-7 rounded-full bg-muted" />
        </div>

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6">
          {/* Page heading */}
          <div className="pb-5 border-b border-border space-y-2">
            <div className="h-6 w-52 rounded-lg bg-muted" />
            <div className="h-3.5 w-72 rounded bg-muted/60" />
          </div>
          {/* KPI grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl bg-muted h-24" />
            ))}
          </div>
          {/* Table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="h-10 bg-muted/70" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-13 border-t border-border/60 bg-muted/20" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) return <AppShellSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
