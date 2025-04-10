
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileContent } from "@/components/profile/ProfileContent";
import { ProfileError } from "@/components/profile/ProfileError";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Process URL parameters for Gmail connection status
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
    } catch (error) {
      console.error("Error processing URL parameters:", error);
    }
  }, [toast]);

  // Show error page if needed
  if (error) {
    return <ProfileError error={error} />;
  }

  // Always render content immediately without waiting for loading states
  // This ensures the UI doesn't get stuck in a blank state
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
