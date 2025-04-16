
import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { GmailConnectionProvider } from "@/contexts/GmailConnectionContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Pages
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import Jobs from "@/pages/Jobs";
import JobDetails from "@/pages/JobDetails";
import Candidates from "@/pages/Candidates";
import CandidateDetails from "@/pages/CandidateDetails";
import TestLogin from "@/pages/TestLogin";
import { GmailCallback } from "@/components/candidates/email/GmailCallback";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 300000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <GmailConnectionProvider>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/candidates" element={<Candidates />} />
                <Route path="/candidates/:id" element={<CandidateDetails />} />
                <Route path="/admin/test-login" element={<TestLogin />} />
                <Route path="/auth/gmail-callback" element={<GmailCallback />} />
              </Routes>
              <Toaster />
            </GmailConnectionProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
