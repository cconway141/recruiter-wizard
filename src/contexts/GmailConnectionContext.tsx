
import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Define error types for better handling
export type GmailConnectionError = {
  type: 'TOKEN_EXPIRED' | 'NOT_CONNECTED' | 'CONNECTION_FAILED' | 'UNKNOWN';
  message: string;
  recoverable: boolean;
  recoveryAction?: 'connect' | 'reconnect';
  details?: any;
};

// Define context type
type GmailConnectionContextType = {
  isConnected: boolean;
  isLoading: boolean;
  lastChecked: number;
  error: GmailConnectionError | null;
  checkConnection: () => Promise<boolean>;
  connectGmail: () => Promise<any>;
  disconnectGmail: () => Promise<boolean>;
  clearError: () => void;
};

// Create the context with default values
export const GmailConnectionContext = createContext<GmailConnectionContextType | undefined>(undefined);

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const GmailConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<number>(0);
  const [error, setError] = useState<GmailConnectionError | null>(null);

  // Categorize and format errors for consistent handling
  const handleGmailOperationError = useCallback((error: any, operationType: string): GmailConnectionError => {
    console.error(`Gmail ${operationType} error:`, error);
    
    const errorMessage = error?.message || error?.error || "Unknown error";
    
    if (errorMessage.includes('token expired') || errorMessage.includes('expired token')) {
      return {
        type: 'TOKEN_EXPIRED',
        message: 'Your Gmail authorization has expired. Please reconnect.',
        recoverable: true,
        recoveryAction: 'reconnect'
      };
    }
    
    if (errorMessage.includes('not connected') || errorMessage.includes('No Gmail connection found')) {
      return {
        type: 'NOT_CONNECTED',
        message: 'Gmail is not connected. Please connect your account.',
        recoverable: true, 
        recoveryAction: 'connect'
      };
    }
    
    if (operationType === 'connection' && errorMessage) {
      return {
        type: 'CONNECTION_FAILED',
        message: `Failed to connect to Gmail: ${errorMessage}`,
        recoverable: true,
        recoveryAction: 'connect',
        details: error
      };
    }
    
    // Default error
    return {
      type: 'UNKNOWN',
      message: `An error occurred with Gmail. Please try again later.`,
      recoverable: false,
      details: error
    };
  }, []);

  // Check the connection status with proper caching
  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    // Use cached value if it's recent enough
    const now = Date.now();
    if (now - lastChecked < CACHE_DURATION) {
      console.log("Using cached Gmail connection status:", isConnected);
      return isConnected;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Checking Gmail connection for user:", user.id);
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'check-connection',
          userId: user.id
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.error === 'Configuration error') {
        throw new Error(data.message || 'Missing Google API configuration');
      }
      
      const connected = !!data?.connected && !data?.expired;
      console.log("Gmail connection status:", connected);
      
      // Update state with fresh data
      setIsConnected(connected);
      setLastChecked(now);
      
      // Also update in sessionStorage for cross-component consistency
      sessionStorage.setItem('gmail_connection_status', connected.toString());
      sessionStorage.setItem('gmail_connection_timestamp', now.toString());
      
      // For backward compatibility (eventually can be removed)
      if (connected) {
        localStorage.setItem('gmail_connected', 'true');
      } else {
        localStorage.removeItem('gmail_connected');
      }
      
      return connected;
    } catch (err) {
      console.error("Error checking Gmail connection:", err);
      const formattedError = handleGmailOperationError(err, 'status-check');
      setError(formattedError);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, lastChecked, isConnected, handleGmailOperationError]);

  // Initialize connection status
  useEffect(() => {
    if (user) {
      // Try to get status from sessionStorage first for quick UI rendering
      const cachedStatus = sessionStorage.getItem('gmail_connection_status');
      const cachedTimestamp = sessionStorage.getItem('gmail_connection_timestamp');
      
      if (cachedStatus && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setIsConnected(cachedStatus === 'true');
          setLastChecked(timestamp);
          return;
        }
      }
      
      // Legacy check to support transition
      const legacyStatus = localStorage.getItem('gmail_connected') === 'true';
      if (legacyStatus) {
        setIsConnected(true);
        setLastChecked(Date.now());
        return;
      }
      
      // If no valid cache, check the connection
      checkConnection().catch(err => {
        console.error("Background connection check failed:", err);
      });
    } else {
      // Reset state when user logs out
      setIsConnected(false);
      setLastChecked(0);
      sessionStorage.removeItem('gmail_connection_status');
      sessionStorage.removeItem('gmail_connection_timestamp');
    }
  }, [user, checkConnection]);

  // Connect to Gmail with improved error handling and state management
  const connectGmail = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect your Gmail account.",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Check for existing connection attempt
      const connectionInProgress = sessionStorage.getItem('gmailConnectionInProgress');
      const connectionAttemptTime = parseInt(sessionStorage.getItem('gmailConnectionAttemptTime') || '0', 10);
      const now = Date.now();
      
      // Prevent multiple simultaneous connection attempts
      if (connectionInProgress === 'true' && (now - connectionAttemptTime) < 30000) {
        toast({
          title: "Connection In Progress",
          description: "A Gmail connection attempt is already in progress.",
          variant: "destructive",
        });
        return null;
      }
      
      // Record the connection attempt
      sessionStorage.setItem('gmailConnectionInProgress', 'true');
      sessionStorage.setItem('gmailConnectionAttemptTime', now.toString());
      
      // Get auth URL from backend
      const redirectUri = `${window.location.origin}/auth/gmail-callback`;
      console.log("Using redirect URI:", redirectUri);
      
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'get-auth-url',
          userId: user.id,
          redirectUri
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data?.url) {
        throw new Error("Failed to generate authentication URL");
      }
      
      console.log("Received auth URL, redirecting to Google's OAuth flow...");
      
      // Redirect to Google's OAuth flow
      window.location.href = data.url;
      return data;
    } catch (err) {
      console.error("Error in connectGmail:", err);
      
      // Clear connection flags
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      
      const formattedError = handleGmailOperationError(err, 'connection');
      setError(formattedError);
      
      toast({
        title: "Connection Error",
        description: formattedError.message,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, handleGmailOperationError]);

  // Disconnect from Gmail
  const disconnectGmail = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Revoke token on server
      const { error } = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'revoke-token',
          userId: user.id
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Clear all connection state
      setIsConnected(false);
      setLastChecked(Date.now());
      
      // Clear connection flags
      sessionStorage.removeItem('gmail_connection_status');
      sessionStorage.removeItem('gmail_connection_timestamp');
      localStorage.removeItem('gmail_connected');
      
      // Invalidate query cache
      queryClient.invalidateQueries({ queryKey: ['gmail-connection'] });
      queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
      
      toast({
        title: "Gmail Disconnected",
        description: "Your Gmail account has been disconnected.",
      });
      
      return true;
    } catch (err) {
      console.error("Error in disconnectGmail:", err);
      
      const formattedError = handleGmailOperationError(err, 'disconnection');
      setError(formattedError);
      
      toast({
        title: "Disconnection Error",
        description: formattedError.message,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, queryClient, handleGmailOperationError]);

  // Utility function to clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const value = {
    isConnected,
    isLoading,
    lastChecked,
    error,
    checkConnection,
    connectGmail,
    disconnectGmail,
    clearError
  };

  return (
    <GmailConnectionContext.Provider value={value}>
      {children}
    </GmailConnectionContext.Provider>
  );
};

// Custom hook for using the Gmail connection context
export const useGmailConnection = () => {
  const context = useContext(GmailConnectionContext);
  if (context === undefined) {
    throw new Error("useGmailConnection must be used within a GmailConnectionProvider");
  }
  return context;
};
