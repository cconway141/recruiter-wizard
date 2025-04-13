import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOperationState } from "@/hooks/useOperationState";

// Cache expiration time in milliseconds (2 minutes)
const CACHE_EXPIRATION = 2 * 60 * 1000;

// Local storage key for Gmail connection
const GMAIL_CONNECTION_CACHE_KEY = 'gmail_connection_status';

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
  const lastCheckRef = useRef<number>(0);
  
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

  // Setup cache clearing on user change
  useEffect(() => {
    if (!user) {
      // Clear connection cache when user logs out
      localStorage.removeItem(GMAIL_CONNECTION_CACHE_KEY);
      lastCheckRef.current = 0;
    }
  }, [user]);

  // Helper to get cached connection status
  const getCachedConnectionStatus = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(GMAIL_CONNECTION_CACHE_KEY);
      
      if (cachedData) {
        const { timestamp, connected } = JSON.parse(cachedData);
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - timestamp < CACHE_EXPIRATION) {
          console.log("Using cached Gmail connection status:", connected);
          return { valid: true, connected };
        }
        
        console.log("Gmail connection cache expired");
      }
    } catch (error) {
      console.error("Error reading Gmail connection cache:", error);
    }
    
    return { valid: false, connected: false };
  }, []);

  // Helper to set cached connection status
  const setCachedConnectionStatus = useCallback((connected: boolean) => {
    try {
      localStorage.setItem(
        GMAIL_CONNECTION_CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          connected
        })
      );
    } catch (error) {
      console.error("Error caching Gmail connection status:", error);
    }
  }, []);

  // Check connection status with caching
  const checkConnection = useCallback(async () => {
    if (!user) return false;
    
    // Check if we have a valid cache entry
    const { valid, connected } = getCachedConnectionStatus();
    if (valid) {
      // Notify about connection state from cache
      if (onConnectionChange) {
        onConnectionChange(connected);
      }
      return connected;
    }
    
    // Throttle actual API checks
    const now = Date.now();
    if (now - lastCheckRef.current < 5000) {
      console.log("Throttling Gmail connection check");
      // Return last known status
      try {
        const cachedData = localStorage.getItem(GMAIL_CONNECTION_CACHE_KEY);
        if (cachedData) {
          const { connected } = JSON.parse(cachedData);
          return connected;
        }
      } catch (e) {
        // Ignore cache errors
      }
      return false;
    }
    
    // Set last check time
    lastCheckRef.current = now;
    
    try {
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
        setCachedConnectionStatus(false);
        throw new Error(`Failed to check Gmail connection: ${error.message}`);
      }
      
      if (data?.error === 'Configuration error') {
        console.error("Gmail configuration error:", data.message);
        setCachedConnectionStatus(false);
        throw new Error(data.message || "Missing Google API configuration");
      }
      
      const isConnected = !!data?.connected && !data?.expired;
      console.log("Gmail connection status:", isConnected);
      
      // Cache the result
      setCachedConnectionStatus(isConnected);
      
      // Notify about connection state change
      if (onConnectionChange) {
        onConnectionChange(isConnected);
      }
      
      return isConnected;
    } catch (error) {
      console.error("Error checking Gmail connection:", error);
      setCachedConnectionStatus(false);
      return false;
    }
  }, [user, onConnectionChange, getCachedConnectionStatus, setCachedConnectionStatus]);

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
      
      // Clear connection cache before redirecting
      localStorage.removeItem(GMAIL_CONNECTION_CACHE_KEY);
      
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
      
      // Token deletion is handled in the edge function
      
      // Clear connection flags
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      
      // Clear connection cache
      localStorage.removeItem(GMAIL_CONNECTION_CACHE_KEY);
      lastCheckRef.current = 0;
      
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
        // Clear cache on token refresh error
        localStorage.removeItem(GMAIL_CONNECTION_CACHE_KEY);
        throw new Error(`Failed to refresh Gmail token: ${error.message}`);
      }
      
      // Update cache after successful refresh
      if (data?.connected) {
        setCachedConnectionStatus(true);
      }
      
      return true;
    });
  }, [user, executeOperation, setCachedConnectionStatus]);

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
