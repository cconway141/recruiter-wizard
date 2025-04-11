
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { JobProvider } from "./contexts/JobContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import AddJob from "./pages/AddJob";
import EditJob from "./pages/EditJob";
import ViewJob from "./pages/ViewJob";
import Settings from "./pages/Settings";
import MessageTemplates from "./pages/MessageTemplates";
import Profile from "./pages/Profile";
import { Toaster } from "./components/ui/toaster";
import { GmailCallback } from "./components/candidates/email/GmailCallback";
import { GoogleCallback } from "./components/auth/GoogleCallback";
import TestLogin from "./pages/admin/TestLogin";

function App() {
  return (
    <Router>
      <AuthProvider>
        <LoadingProvider>
          <JobProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<GoogleCallback />} />
              <Route path="/auth/gmail-callback" element={<GmailCallback />} />
              {process.env.NODE_ENV !== 'production' && (
                <Route path="/admin/test-login" element={<TestLogin />} />
              )}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs/add"
                element={
                  <ProtectedRoute>
                    <AddJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs/new"
                element={
                  <ProtectedRoute>
                    <AddJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs/:id"
                element={
                  <ProtectedRoute>
                    <ViewJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/message-templates"
                element={
                  <ProtectedRoute>
                    <MessageTemplates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </JobProvider>
        </LoadingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
