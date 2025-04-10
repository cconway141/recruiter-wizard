
import React, { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGmailAuth } from "@/hooks/useGmailAuth";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ConfigErrorButton } from "./ConfigErrorButton";

interface GmailConnectButtonProps {
  className?: string;
  onConnectionChange?: (connected: boolean) => void;
}

export const GmailConnectButton: React.FC<GmailConnectButtonProps> = ({ 
  className,
  onConnectionChange 
}) => {
  const { user } = useAuth();
  const { isGmailConnected, isCheckingGmail, disconnectGmail } = useGmailAuth();
  const { toast } = useToast();

  // Notify parent component when connection status changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(isGmailConnected);
    }
  }, [isGmailConnected, onConnectionChange]);

  // Function to initiate the Gmail connection flow
  const connectGmail = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to connect Gmail",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Starting Gmail connection process...");
      
      // Record the connection attempt time
      sessionStorage.setItem('gmailConnectionInProgress', 'true');
      sessionStorage.setItem('gmailConnectionAttemptTime', Date.now().toString());
      
      // Get the authorization URL from the edge function
      const { data, error } = await supabase.functions.invoke("google-auth", {
        body: {
          action: "get-auth-url",
          userId: user.id,
          redirectUri: `${window.location.origin}/auth/gmail-callback`,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.authUrl) {
        throw new Error("Failed to get authorization URL");
      }

      console.log("Opening Google auth window...");
      
      // Open the Google authorization page
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Error connecting to Gmail:", error);
      
      // Clear connection attempt flags
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Gmail. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  useEffect(() => {
    // Check if we just completed a connection process and clean up
    const urlParams = new URLSearchParams(window.location.search);
    const gmailConnected = urlParams.get('gmail_connected');
    
    if (gmailConnected === 'true') {
      // Clean URL without reloading the page
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Clear connection attempt flags
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      
      toast({
        title: "Gmail Connected",
        description: "Your Gmail account has been connected successfully!",
      });
      
      // Notify parent about successful connection
      if (onConnectionChange) {
        onConnectionChange(true);
      }
    } else if (gmailConnected === 'false') {
      // Clean URL without reloading the page
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Clear connection attempt flags
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Gmail. Please try again.",
        variant: "destructive",
      });
      
      // Notify parent about failed connection
      if (onConnectionChange) {
        onConnectionChange(false);
      }
    }
  }, [toast, onConnectionChange]);

  return (
    <ConfigErrorButton
      isConnected={isGmailConnected}
      onClick={connectGmail}
      onDisconnect={disconnectGmail}
      className={className}
    />
  );
};
