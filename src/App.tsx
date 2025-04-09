
import React, { useEffect } from 'react';
import {
  Route,
  Routes,
  useNavigate,
  useLocation,
  Link
} from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import Jobs from '@/pages/Jobs';
import JobDetail from '@/pages/JobDetail';
import Candidates from '@/pages/Candidates';
import CandidateDetail from '@/pages/CandidateDetail';
import Auth from '@/pages/Auth';
import { GoogleCallback } from '@/components/auth/GoogleCallback';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MainNav } from "@/components/layout/MainNav";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { siteConfig } from "@/config/site";
import { ModeToggle } from "@/components/layout/ModeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { GmailCallback } from './components/candidates/email/GmailCallback';

function App() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect to /auth if not logged in and not on /auth or /auth/google-callback
    if (!user && !loading && !['/auth', '/auth/google-callback', '/auth/gmail-callback'].includes(location.pathname)) {
      console.log('Not authenticated, redirecting to /auth');
      navigate('/auth');
    }
    // Redirect to /dashboard if logged in and on /auth
    else if (user && location.pathname === '/auth') {
      console.log('Authenticated, redirecting to /dashboard');
      navigate('/dashboard');
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
    <div className="flex min-h-screen bg-background antialiased">
      <aside className="border-r bg-secondary w-60 flex-none hidden lg:block">
        <ScrollArea className="py-6 pr-4">
          <Link to="/" className="flex items-center gap-2 px-4">
            {siteConfig.name}
          </Link>
          <Separator className="my-2" />
          <MainNav className="px-4" />
          <Separator className="my-2" />
          <SidebarNav className="px-4" />
        </ScrollArea>
      </aside>
      <div className="flex-1">
        <div className="border-b">
          <div className="container flex items-center gap-6 p-4">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-3/4 border-r lg:hidden">
                <SheetHeader className="text-left">
                  <SheetTitle>{siteConfig.name}</SheetTitle>
                </SheetHeader>
                <ScrollArea className="my-2">
                  <MainNav className="px-4" />
                  <Separator className="my-2" />
                  <SidebarNav className="px-4" />
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <MainNav className="mx-6 hidden lg:block" />
            <div className="ml-auto flex items-center space-x-2">
              <ModeToggle />
            </div>
          </div>
        </div>
        <main className="container py-10">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route path="/auth/gmail-callback" element={<GmailCallback />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/candidates/:candidateId" element={<CandidateDetail />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
