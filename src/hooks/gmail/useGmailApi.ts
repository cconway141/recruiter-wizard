import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOperationState } from "@/hooks/useOperationState";

/**
 * Core hook for Gmail API operations
 * Provides a unified interface for all Gmail-related functionality
 */
export const useGmailApi = (options: {
  showLoadingUI?: boolean;
  onConnectionChange?: (connected: boolean) => void;
} = {}) => {
  const { showLoadingUI = true, onConnectionChange } = options;
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use our enhanced operation state hook
  const {
    isLoading,
    error,
    clearError,
    executeOperation,
    executeSilentOperation
  } = useOperationState({
    id: "gmail-api",
    showLoadingUI
  });

  // Check connection status
  const checkConnection = useCallback(async () => {
    if (!user) return false;
    
    try {
      console.log("useGmailApi: Checking Gmail connection for user", user.id);
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'check-connection',
          userId: user.id
        }
      });
      
      if (error) {
        console.error("Error checking Gmail connection:", error);
        throw new Error(`Failed to check Gmail connection: ${error.message}`);
      }
      
      if (data?.error === 'Configuration error') {
        console.error("Gmail configuration error:", data.message);
        throw new Error(data.message || "Missing Google API configuration");
      }
      
      const isConnected = !!data?.connected && !data?.expired;
      console.log("Gmail connection status:", isConnected);
      
      // Notify about connection state change
      if (onConnectionChange) {
        onConnectionChange(isConnected);
      }
      
      return isConnected;
    } catch (error) {
      console.error("Error checking Gmail connection:", error);
      return false;
    }
  }, [user, onConnectionChange]);

  // Connect Gmail using OAuth flow
  const connectGmail = useCallback(async () => {
    console.log("useGmailApi: connectGmail called");
    
    return executeOperation(async () => {
      console.log("useGmailApi: executeOperation for connectGmail starting");
      
      if (!user) {
        console.error("Cannot connect Gmail: No user logged in");
        toast({
          title: "Authentication Required",
          description: "Please log in to connect your Gmail account.",
          variant: "destructive",
        });
        return null;
      }
      
      try {
        // Check for in-progress connection
        const connectionInProgress = sessionStorage.getItem('gmailConnectionInProgress');
        if (connectionInProgress === 'true') {
          console.log("Connection already in progress");
          toast({
            title: "Connection Already in Progress",
            description: "A Gmail connection attempt is already in progress.",
            variant: "destructive",
          });
          return null;
        }
        
        // Record the connection attempt
        sessionStorage.setItem('gmailConnectionInProgress', 'true');
        sessionStorage.setItem('gmailConnectionAttemptTime', Date.now().toString());
        
        console.log("Getting auth URL from backend");
        // Get auth URL from backend
        const { data, error } = await supabase.functions.invoke('google-auth', {
          body: {
            action: 'get-auth-url',
            userId: user.id,
            redirectUri: `${window.location.origin}/auth/gmail-callback`
          }
        });
        
        if (error) {
          console.error("Error getting auth URL:", error);
          throw new Error(error.message || "Failed to start Gmail connection");
        }
        
        if (!data?.url) {
          console.error("No auth URL returned:", data);
          throw new Error("Failed to generate authentication URL");
        }
        
        console.log("Received auth URL, redirecting...");
        // Redirect to Google's OAuth flow
        window.location.href = data.url;
        return data;
      } catch (error) {
        console.error("Error in connectGmail:", error);
        // Clear connection flags
        sessionStorage.removeItem('gmailConnectionInProgress');
        sessionStorage.removeItem('gmailConnectionAttemptTime');
        
        throw error;
      }
    });
  }, [user, executeOperation, toast]);

  // Disconnect Gmail
  const disconnectGmail = useCallback(async () => {
    return executeOperation(async () => {
      if (!user) return false;
      
      // First revoke the token through Google
      const { error: revokeError } = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'revoke-token',
          userId: user.id
        }
      });
      
      if (revokeError) {
        console.error("Error revoking Gmail token:", revokeError);
      }
      
      // Delete token from database
      const { error: deleteError } = await supabase
        .from('gmail_tokens')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) {
        throw new Error(`Failed to disconnect Gmail: ${deleteError.message}`);
      }
      
      // Clear connection flags
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      
      // Notify about connection change
      if (onConnectionChange) {
        onConnectionChange(false);
      }
      
      toast({
        title: "Gmail Disconnected",
        description: "Your Gmail account has been disconnected.",
      });
      
      return true;
    });
  }, [user, executeOperation, toast, onConnectionChange]);

  // Refresh token
  const refreshToken = useCallback(async () => {
    return executeOperation(async () => {
      if (!user) return false;
      
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'refresh-token',
          userId: user.id
        }
      });
      
      if (error) {
        throw new Error(`Failed to refresh Gmail token: ${error.message}`);
      }
      
      return true;
    });
  }, [user, executeOperation]);

  // Background connection check (without UI indicators)
  const silentCheckConnection = useCallback(async () => {
    return executeSilentOperation(async () => {
      return checkConnection();
    });
  }, [executeSilentOperation, checkConnection]);

  return {
    isLoading,
    error,
    clearError,
    checkConnection,
    silentCheckConnection,
    connectGmail,
    disconnectGmail,
    refreshToken
  };
};
