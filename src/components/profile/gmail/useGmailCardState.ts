
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGmailConnection } from "@/hooks/gmail";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useGmailCardState = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Use the combined hook that provides all Gmail functionality
  const { 
    isConnected: isGmailConnected, 
    isLoading: isCheckingGmail, 
    disconnectGmail,
    checkGmailConnection,
  } = useGmailConnection();
  
  // Clear connection flags and trigger a background refresh
  useEffect(() => {
    if (user?.id) {
      // Run a single background connection check without blocking UI
      checkGmailConnection().catch(() => {
        // Silently handle errors - we'll just show connect button
        console.log("Background Gmail check failed - silently continuing");
      });
      
      // Clear any stale connection flags that might be in session storage
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
    }
  }, [user?.id, checkGmailConnection]);
  
  const handleDisconnectGmail = async () => {
    try {
      // Call the disconnect function from our hook
      await disconnectGmail();
      
      // Clear connection flags
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      
      // Force refresh connection status - silently
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
      }
    } catch (error) {
      console.error("Error disconnecting Gmail:", error);
      // No UI error shown - we'll silently fail and let the UI revert to "Connect" state
    }
  };
  
  return {
    isGmailConnected,
    isCheckingGmail,
    handleDisconnectGmail,
  };
};
