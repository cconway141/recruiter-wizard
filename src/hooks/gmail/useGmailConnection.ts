
import { useState, useEffect, useCallback } from "react";
import { useGmailApi } from "./useGmailApi";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface UseGmailConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
  showLoadingUI?: boolean;
}

/**
 * Simplified hook for Gmail connection management
 * Uses React Query for caching and state management with improved performance
 */
export const useGmailConnection = ({
  onConnectionChange,
  showLoadingUI = true
}: UseGmailConnectionProps = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);
  const minimumCheckInterval = 30000; // 30 seconds between connection checks
  
  // Use our unified Gmail API hook
  const {
    isLoading,
    error: apiError,
    clearError,
    checkConnection,
    silentCheckConnection,
    connectGmail: apiConnectGmail, 
    disconnectGmail: apiDisconnectGmail, 
    refreshToken: refreshGmailToken
  } = useGmailApi({
    showLoadingUI,
    onConnectionChange: (connected) => {
      setConnectionStatus(connected);
      if (onConnectionChange) onConnectionChange(connected);
    }
  });
  
  // Throttled connection check to prevent excessive API calls
  const throttledCheckConnection = useCallback(async () => {
    const now = Date.now();
    if (now - lastCheckTime < minimumCheckInterval) {
      console.log(`Throttled Gmail connection check (${Math.round((now - lastCheckTime)/1000)}s < ${minimumCheckInterval/1000}s)`);
      return connectionStatus ?? false;
    }
    
    console.log("Performing actual Gmail connection check");
    setLastCheckTime(now);
    return await silentCheckConnection();
  }, [connectionStatus, lastCheckTime, silentCheckConnection]);
  
  // Critical fix: simplifying the connectGmail function with better error handling
  const connectGmail = useCallback(async () => {
    console.debug("useGmailConnection: connectGmail called");
    if (!user) {
      console.error("Cannot connect Gmail: No user logged in");
      return null;
    }
    
    try {
      console.debug("Directly calling apiConnectGmail from useGmailConnection");
      return await apiConnectGmail();
    } catch (error) {
      console.error("Error in connectGmail:", error);
      return null;
    }
  }, [user, apiConnectGmail]);
  
  // Create wrapper function for disconnectGmail
  const disconnectGmail = useCallback(async () => {
    console.debug("useGmailConnection: disconnectGmail called");
    try {
      return await apiDisconnectGmail();
    } catch (error) {
      console.error("Error in disconnectGmail:", error);
      return false;
    }
  }, [apiDisconnectGmail]);
  
  // Use React Query for connection state caching with improved performance settings
  const { data: connectionInfo } = useQuery({
    queryKey: ['gmail-connection', user?.id],
    queryFn: throttledCheckConnection,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes (increased from 10 minutes)
    refetchInterval: 15 * 60 * 1000, // 15 minutes (increased from 30 minutes)
    refetchOnWindowFocus: false,
    retry: 0, // No retries to avoid cascading failures
    gcTime: 60 * 60 * 1000, // 1 hour
  });
  
  // Use connection info from query when available
  useEffect(() => {
    if (connectionInfo !== undefined) {
      // Only update if there's an actual change to avoid re-renders
      if (connectionStatus !== connectionInfo) {
        setConnectionStatus(connectionInfo);
        if (onConnectionChange) onConnectionChange(connectionInfo);
      }
    }
  }, [connectionInfo, connectionStatus, onConnectionChange]);
  
  // Force refresh connection status - with added throttling
  const forceRefresh = useCallback(async () => {
    if (!user) return false;
    
    const now = Date.now();
    if (now - lastCheckTime < minimumCheckInterval) {
      console.log(`Throttled force refresh (${Math.round((now - lastCheckTime)/1000)}s < ${minimumCheckInterval/1000}s)`);
      return connectionStatus ?? false;
    }
    
    setLastCheckTime(now);
    
    try {
      // Don't immediately invalidate - use a small timeout
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
      }, 100);
      
      return await checkConnection();
    } catch (error) {
      console.error("Error in forceRefresh:", error);
      return connectionStatus ?? false;
    }
  }, [user, queryClient, checkConnection, connectionStatus, lastCheckTime]);
  
  // Only check connection once on mount - not on every render
  useEffect(() => {
    if (user?.id) {
      // Use throttled check to prevent excessive API calls
      const now = Date.now();
      if (now - lastCheckTime >= minimumCheckInterval) {
        setLastCheckTime(now);
        silentCheckConnection().catch(err => {
          console.error("Background connection check failed:", err);
        });
      }
    }
  }, [user?.id, silentCheckConnection, lastCheckTime]);
  
  return {
    isConnected: connectionStatus ?? false,
    isLoading,
    configError: apiError?.message,
    connectGmail,
    disconnectGmail, 
    checkGmailConnection: throttledCheckConnection, // Use throttled version
    silentCheckConnection,
    refreshGmailToken,
    forceRefresh,
    clearError
  };
};
