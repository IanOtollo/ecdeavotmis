import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Suspense, lazy } from "react";

// Eager
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Institutions = lazy(() => import("./pages/Institutions"));
const InstitutionDetail = lazy(() => import("./pages/InstitutionDetail"));
const InstitutionBioData = lazy(() => import("./pages/InstitutionBioData"));
const Infrastructure = lazy(() => import("./pages/Infrastructure"));
const BankAccount = lazy(() => import("./pages/BankAccount"));
const CapitationReceipts = lazy(() => import("./pages/CapitationReceipts"));
const SchoolBooks = lazy(() => import("./pages/SchoolBooks"));
const EmergencyReporting = lazy(() => import("./pages/EmergencyReporting"));
const MyInstitution = lazy(() => import("./pages/MyInstitution"));
const CaptureLearners = lazy(() => import("./pages/CaptureLearners"));
const ViewLearners = lazy(() => import("./pages/ViewLearners"));
const SearchLearners = lazy(() => import("./pages/SearchLearners"));
const TransferLearners = lazy(() => import("./pages/TransferLearners"));
const DeceasedLearner = lazy(() => import("./pages/DeceasedLearner"));
const AdmissionReport = lazy(() => import("./pages/AdmissionReport"));
const MyLearners = lazy(() => import("./pages/MyLearners"));
const UPIReport = lazy(() => import("./pages/UPIReport"));
const InstitutionStatistics = lazy(() => import("./pages/InstitutionStatistics"));
const LearnerDetail = lazy(() => import("./pages/LearnerDetail"));
const Teachers = lazy(() => import("./pages/Teachers"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminAuditLog = lazy(() => import("./pages/admin/AuditLog"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const Profile = lazy(() => import("./pages/Profile"));

function PageLoader() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="pb-5 border-b border-border space-y-2">
        <div className="h-6 w-48 rounded-lg bg-muted" />
        <div className="h-3.5 w-64 rounded bg-muted/60" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="rounded-xl bg-muted h-24" />)}
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="h-10 bg-muted/70" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 border-t border-border/60 bg-muted/20" />
        ))}
      </div>
    </div>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 bg-background overflow-auto">
            <Suspense fallback={<PageLoader />}>{children}</Suspense>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <TooltipProvider>
      <Sonner richColors position="top-right" />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Auth />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* Institutions */}
                  <Route path="/institutions" element={<Institutions />} />
                  <Route path="/institutions/new" element={<Navigate to="/institutions" replace />} />
                  <Route path="/institutions/:id" element={<InstitutionDetail />} />
                  <Route path="/institution/bio-data" element={<InstitutionBioData />} />
                  <Route path="/institution/profile" element={<MyInstitution />} />
                  <Route path="/institution/infrastructure" element={<Infrastructure />} />
                  <Route path="/institution/bank" element={<BankAccount />} />
                  <Route path="/institution/capitation" element={<CapitationReceipts />} />
                  <Route path="/institution/books" element={<SchoolBooks />} />
                  <Route path="/institution/emergency" element={<EmergencyReporting />} />
                  <Route path="/institution/teachers" element={<Teachers />} />

                  {/* Learners */}
                  <Route path="/learners/capture/ecde" element={<CaptureLearners programType="ecde" />} />
                  <Route path="/learners/capture/vocational" element={<CaptureLearners programType="vocational" />} />
                  <Route path="/learners/view" element={<ViewLearners />} />
                  <Route path="/learners/search" element={<SearchLearners />} />
                  <Route path="/learners/transfer" element={<TransferLearners />} />
                  <Route path="/learners/deceased" element={<DeceasedLearner />} />
                  <Route path="/learners/:id" element={<LearnerDetail />} />

                  {/* Reports */}
                  <Route path="/reports/admission" element={<AdmissionReport />} />
                  <Route path="/reports/my-learners" element={<MyLearners />} />
                  <Route path="/reports/upi" element={<UPIReport />} />
                  <Route path="/reports/statistics" element={<InstitutionStatistics />} />

                  {/* Admin */}
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/audit" element={<AdminAuditLog />} />

                  {/* Utility */}
                  <Route path="/utility/password" element={<ChangePassword />} />
                  <Route path="/utility/profile" element={<Profile />} />

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </TooltipProvider>
  );
}
