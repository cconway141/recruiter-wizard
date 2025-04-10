
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOperationState } from "@/hooks/useOperationState";

// Cache key for local storage
const CONNECTION_CACHE_KEY = 'gmail_api_connection_cache';
const CACHE_EXPIRY_KEY = 'gmail_api_cache_expiry';

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

  // Get cached connection status
  const getCachedConnection = useCallback(() => {
    try {
      const expiryStr = localStorage.getItem(CACHE_EXPIRY_KEY);
      if (!expiryStr) return null;
      
      const expiry = parseInt(expiryStr);
      if (Date.now() > expiry) {
        // Cache expired
        localStorage.removeItem(CONNECTION_CACHE_KEY);
        localStorage.removeItem(CACHE_EXPIRY_KEY);
        return null;
      }
      
      const data = localStorage.getItem(CONNECTION_CACHE_KEY);
      return data ? data === 'true' : null;
    } catch (e) {
      return null;
    }
  }, []);
  
  // Set cached connection status
  const setCachedConnection = useCallback((isConnected: boolean) => {
    try {
      localStorage.setItem(CONNECTION_CACHE_KEY, isConnected.toString());
      // Cache for 1 hour
      const expiry = Date.now() + (60 * 60 * 1000);
      localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
    } catch (e) {
      console.error("Failed to cache connection status:", e);
    }
  }, []);

  // Check connection status with caching
  const checkConnection = useCallback(async () => {
    if (!user) return false;
    
    try {
      // Check cache first
      const cached = getCachedConnection();
      if (cached !== null) {
        console.log("Using cached Gmail connection status");
        if (onConnectionChange) {
          onConnectionChange(cached);
        }
        return cached;
      }
      
      console.log("useGmailApi: Checking Gmail connection for user", user.id);
      
      // Use the correct method to call the edge function
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
      
      // Cache the result
      setCachedConnection(isConnected);
      
      // Notify about connection state change
      if (onConnectionChange) {
        onConnectionChange(isConnected);
      }
      
      return isConnected;
    } catch (error) {
      console.error("Error checking Gmail connection:", error);
      return false;
    }
  }, [user, onConnectionChange, getCachedConnection, setCachedConnection]);

  // Connect Gmail using OAuth flow
  const connectGmail = useCallback(async () => {
    console.log("useGmailApi: connectGmail called");
    
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
      
      // Determine the current origin for the redirect URI
      const redirectUri = `${window.location.origin}/auth/gmail-callback`;
      console.log("Using redirect URI:", redirectUri);
      
      // Get auth URL from backend with explicit redirect URI
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'get-auth-url',
          userId: user.id,
          redirectUri: redirectUri
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
      
      console.log("Received auth URL:", data.url.substring(0, 50) + "...");
      console.log("Redirect URI:", data.redirectUri);
      console.log("About to redirect to Google's OAuth flow");
      
      // Redirect to Google's OAuth flow
      window.location.href = data.url;
      return data;
    } catch (error) {
      console.error("Error in connectGmail:", error);
      // Clear connection flags
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to Gmail",
        variant: "destructive",
      });
      
      return null;
    }
  }, [user, toast]);

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
      
      // Clear all caches
      try {
        localStorage.removeItem(CONNECTION_CACHE_KEY);
        localStorage.removeItem(CACHE_EXPIRY_KEY);
        sessionStorage.removeItem('gmail_connection_cache');
        sessionStorage.removeItem('gmail_connection_cache_expiry');
        sessionStorage.removeItem('gmail_connection_status');
        sessionStorage.removeItem('gmail_connection_check_time');
      } catch (e) {
        console.error("Error clearing connection caches:", e);
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
      
      // Update cache after successful refresh
      setCachedConnection(true);
      
      return true;
    });
  }, [user, executeOperation, setCachedConnection]);

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
