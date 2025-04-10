
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGmailConnection } from "@/hooks/gmail";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useGmailCardState = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Use the combined hook with skipLoading to prevent UI blocking
  // This ensures the hook never reports a "loading" state to the UI
  const { 
    isConnected: isGmailConnected, 
    disconnectGmail,
    checkGmailConnection,
  } = useGmailConnection({ 
    skipLoading: true // Critical: This prevents loading states from affecting UI
  });
  
  // Handle disconnection with better error resilience
  const handleDisconnectGmail = async () => {
    try {
      // Call the disconnect function from our hook
      await disconnectGmail();
      
      // Clear connection flags - these could cause UI issues if stale
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      
      // Force refresh connection status - use setTimeout to prevent UI blocking
      if (user?.id) {
        setTimeout(() => {
          // This now only runs after disconnect is complete and outside the main render cycle
          queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
        }, 100);
      }
    } catch (error) {
      console.error("Error disconnecting Gmail:", error);
      // No UI error shown - silently fail and let the UI stay in current state
    }
  };
  
  // We deliberately don't run any connection checks on mount
  // The parent component should control when checks happen
  
  return {
    isGmailConnected,
    handleDisconnectGmail,
  };
};
