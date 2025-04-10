
import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGmailConnection } from "@/hooks/gmail";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLoadingOperation } from "@/hooks/useLoadingOperation";

export const useGmailCardState = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Use the standardized connection hook with showLoadingUI=false
  // This replaces the skipLoading pattern with a more explicit approach
  const { 
    isConnected: isGmailConnected, 
    disconnectGmail: rawDisconnectGmail,
    silentCheckConnection,
  } = useGmailConnection({ 
    showLoadingUI: false // Explicit setting replacing skipLoading=true
  });
  
  // Use our loading operation hook for disconnect operations
  const { 
    executeOperation 
  } = useLoadingOperation({ 
    id: "gmail-disconnect", 
    showLoadingUI: true
  });
  
  // Handle disconnection with better error resilience
  const handleDisconnectGmail = useCallback(async () => {
    return executeOperation(async () => {
      try {
        // Call the disconnect function from our hook
        await rawDisconnectGmail();
        
        // Clear connection flags - these could cause UI issues if stale
        sessionStorage.removeItem('gmailConnectionInProgress');
        sessionStorage.removeItem('gmailConnectionAttemptTime');
        
        // Force refresh connection status
        if (user?.id) {
          queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
        }
      } catch (error) {
        console.error("Error disconnecting Gmail:", error);
        // No UI error shown - silently fail and let the UI stay in current state
      }
    });
  }, [executeOperation, rawDisconnectGmail, user?.id, queryClient]);
  
  // Silently check connection on mount without showing loading UI
  useEffect(() => {
    if (user?.id) {
      silentCheckConnection().catch(err => {
        console.error("Silent connection check error:", err);
      });
    }
  }, [user?.id, silentCheckConnection]);
  
  return {
    isGmailConnected,
    handleDisconnectGmail,
  };
};
