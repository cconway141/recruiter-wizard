
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface UseGmailAuthFlowProps {
  onConnectionChange?: (connected: boolean) => void;
}

export const useGmailAuthFlow = ({ onConnectionChange }: UseGmailAuthFlowProps = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const connectGmail = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect your Gmail account.",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      // Check to see if there's a connection attempt in progress
      const connectionInProgress = sessionStorage.getItem('gmailConnectionInProgress');
      if (connectionInProgress === 'true') {
        toast({
          title: "Connection Already in Progress",
          description: "A Gmail connection attempt is already in progress. Please complete it or wait a moment before trying again.",
          variant: "destructive",
        });
        return null;
      }
      
      console.log("Initiating Gmail connection for user:", user.id);
      
      // Record the connection attempt time
      sessionStorage.setItem('gmailConnectionInProgress', 'true');
      sessionStorage.setItem('gmailConnectionAttemptTime', Date.now().toString());
      
      // Get the auth URL from our backend
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'get-auth-url',
          userId: user.id,
          redirectUri: `${window.location.origin}/auth/gmail-callback`
        }
      });
      
      if (error) {
        console.error("Error getting Gmail auth URL:", error);
        throw new Error(error.message || "Failed to start Gmail connection");
      }
      
      if (!data || !data.url) {
        console.error("No auth URL returned from function:", data);
        throw new Error("Failed to generate authentication URL");
      }
      
      console.log("Received auth URL:", data.url.substring(0, 50) + "...");
      console.log("Redirect URI:", data.redirectUri);
      
      // Only redirect if we have a valid URL
      if (data.url) {
        // Redirect to Google's OAuth flow
        window.location.href = data.url;
      } else {
        console.error("No auth URL returned from the function");
        toast({
          title: "Error",
          description: "Failed to generate authentication URL.",
          variant: "destructive",
        });
        return null;
      }
      
      // Return the redirect URI for debugging
      return { 
        redirectUri: data.redirectUri,
        url: data.url,
        clientId: data.clientId
      };
    } catch (error) {
      console.error("Error connecting Gmail:", error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect Gmail",
        variant: "destructive",
      });
      
      // Clear connection flags
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      
      return null;
    }
  };

  return {
    connectGmail
  };
};
