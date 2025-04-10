
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { ProfileLoading } from "@/components/profile/ProfileLoading";
import { ProfileError } from "@/components/profile/ProfileError";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [gmailRefreshAttempted, setGmailRefreshAttempted] = useState(false);
  const { toast } = useToast();

  // Initialize page and handle URL parameters for Gmail connection
  useEffect(() => {
    try {
      // Check URL parameters for Gmail connection status
      const urlParams = new URLSearchParams(window.location.search);
      const gmailConnected = urlParams.get('gmail_connected');
      
      if (gmailConnected) {
        // Clear URL params without page refresh
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Show appropriate toast notification
        if (gmailConnected === 'true') {
          toast({
            title: "Gmail Connected",
            description: "Your Gmail account has been connected successfully!",
          });
        } else if (gmailConnected === 'false') {
          toast({
            title: "Connection Failed",
            description: "Failed to connect to Gmail. Please try again.",
            variant: "destructive",
          });
        }
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error("Error processing URL parameters:", error);
      setIsInitialized(true);
    }
  }, [toast]);
  
  // Separate effect for Gmail query invalidation
  useEffect(() => {
    if (user?.id && !gmailRefreshAttempted) {
      try {
        // Use setTimeout to defer this operation after initial render
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
          setGmailRefreshAttempted(true);
        }, 500);
      } catch (error) {
        console.error("Error refreshing Gmail connection:", error);
      }
    }
  }, [user?.id, queryClient, gmailRefreshAttempted]);

  if (!isInitialized) {
    return <ProfileLoading />;
  }

  if (error) {
    return <ProfileError error={error} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <PageHeader 
          title="User Profile" 
          description="Manage your application settings"
        />
        <ProfileContent setError={setError} />
      </main>
    </div>
  );
};

export default Profile;
