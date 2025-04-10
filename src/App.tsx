
import React, { useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Dashboard } from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import { GoogleCallback } from '@/components/auth/GoogleCallback';
import { useToast } from '@/hooks/use-toast';
import { GmailCallback } from './components/candidates/email/GmailCallback';
import Profile from '@/pages/Profile';
import Index from '@/pages/Index';
import ViewJob from '@/pages/ViewJob';

function App() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect to /auth if not logged in and not on /auth or /auth/google-callback
    if (!user && !loading && !['/auth', '/auth/google-callback'].includes(location.pathname)) {
      console.log('Not authenticated, redirecting to /auth');
      navigate('/auth');
    }
    // Redirect to /dashboard if logged in and on /auth
    else if (user && location.pathname === '/auth') {
      console.log('Authenticated, redirecting to /dashboard');
      navigate('/');
    }
  }, [user, loading, location, navigate]);

  const signOut = () => {
    // Sign out logic here
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-10">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/auth/gmail-callback" element={<GmailCallback />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs/:id" element={<ViewJob />} />
          <Route path="/" element={<Index />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
