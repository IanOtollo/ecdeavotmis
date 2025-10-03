import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import InitialSetup from "./pages/InitialSetup";
import Dashboard from "./pages/Dashboard";
import InstitutionBioData from "./pages/InstitutionBioData";
import CaptureLearners from "./pages/CaptureLearners";
import EmergencyReporting from "./pages/EmergencyReporting";
import TransferLearners from "./pages/TransferLearners";
import Infrastructure from "./pages/Infrastructure";
import MyInstitution from "./pages/MyInstitution";
import BankAccount from "./pages/BankAccount";
import CapitationReceipts from "./pages/CapitationReceipts";
import SchoolBooks from "./pages/SchoolBooks";
import CaptureStudents from "./pages/CaptureStudents";
import ViewLearners from "./pages/ViewLearners";
import SearchLearners from "./pages/SearchLearners";
import DeceasedLearner from "./pages/DeceasedLearner";
import AdmissionReport from "./pages/AdmissionReport";
import MyLearners from "./pages/MyLearners";
import UPIReport from "./pages/UPIReport";
import ChangePassword from "./pages/ChangePassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/setup" element={<InitialSetup />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                      <Header />
                      <main className="flex-1 bg-background">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/institution/bio-data" element={<InstitutionBioData />} />
                          <Route path="/institution/infrastructure" element={<Infrastructure />} />
                          <Route path="/institution/emergency" element={<EmergencyReporting />} />
                          <Route path="/institution/profile" element={<MyInstitution />} />
                          <Route path="/institution/bank" element={<BankAccount />} />
                          <Route path="/institution/capitation" element={<CapitationReceipts />} />
                          <Route path="/institution/books" element={<SchoolBooks />} />
                          <Route path="/learners/capture" element={<CaptureLearners />} />
                          <Route path="/learners/capture-students" element={<CaptureStudents />} />
                          <Route path="/learners/view" element={<ViewLearners />} />
                          <Route path="/learners/search" element={<SearchLearners />} />
                          <Route path="/learners/deceased" element={<DeceasedLearner />} />
                          <Route path="/learners/transfer" element={<TransferLearners />} />
                          <Route path="/reports/admission" element={<AdmissionReport />} />
                          <Route path="/reports/my-learners" element={<MyLearners />} />
                          <Route path="/reports/upi" element={<UPIReport />} />
                          <Route path="/utility/password" element={<ChangePassword />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
