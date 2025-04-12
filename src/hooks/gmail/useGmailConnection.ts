
import { useState, useEffect, useCallback } from "react";
import { useGmailApi } from "./useGmailApi";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface UseGmailConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
  showLoadingUI?: boolean;
}

/**
 * Optimized hook for Gmail connection management
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
  
  // Increased throttle time to reduce excessive checks
  const minimumCheckInterval = 60000; // 60 seconds between connection checks (up from 30s)
  
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
  
  // Efficient connection check with improved caching
  const throttledCheckConnection = useCallback(async () => {
    const now = Date.now();
    
    // Check local connectionStatus first to avoid unnecessary checks
    if (connectionStatus !== null && now - lastCheckTime < minimumCheckInterval) {
      console.log(`Using cached Gmail connection status (${Math.round((now - lastCheckTime)/1000)}s < ${minimumCheckInterval/1000}s)`);
      return connectionStatus;
    }
    
    // Cache connection check timestamp
    setLastCheckTime(now);
    
    try {
      // Get status from localStorage if available
      const cachedStatus = localStorage.getItem('gmail_connection_status');
      const cachedTimestamp = localStorage.getItem('gmail_connection_timestamp');
      
      if (cachedStatus && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        if (now - timestamp < minimumCheckInterval) {
          console.log('Using localStorage cached Gmail connection status');
          return cachedStatus === 'true';
        }
      }
      
      // Only if no valid cache exists, perform actual check
      console.log("Performing actual Gmail connection check");
      const status = await silentCheckConnection();
      
      // Cache the result in localStorage
      localStorage.setItem('gmail_connection_status', status.toString());
      localStorage.setItem('gmail_connection_timestamp', now.toString());
      
      return status;
    } catch (error) {
      console.error("Error in throttledCheck:", error);
      return connectionStatus ?? false;
    }
  }, [connectionStatus, lastCheckTime, silentCheckConnection, minimumCheckInterval]);
  
  // Wrapper for connectGmail with better error handling
  const connectGmail = useCallback(async () => {
    if (!user) {
      console.error("Cannot connect Gmail: No user logged in");
      return null;
    }
    
    try {
      return await apiConnectGmail();
    } catch (error) {
      console.error("Error in connectGmail:", error);
      return null;
    }
  }, [user, apiConnectGmail]);
  
  // Wrapper for disconnectGmail
  const disconnectGmail = useCallback(async () => {
    try {
      return await apiDisconnectGmail();
    } catch (error) {
      console.error("Error in disconnectGmail:", error);
      return false;
    }
  }, [apiDisconnectGmail]);
  
  // Use React Query with optimized cache settings
  const { data: connectionInfo } = useQuery({
    queryKey: ['gmail-connection', user?.id],
    queryFn: throttledCheckConnection,
    enabled: !!user,
    // Greatly improved caching parameters to reduce API calls
    staleTime: 10 * 60 * 1000, // 10 minutes (increased from 5 minutes)
    refetchInterval: 30 * 60 * 1000, // 30 minutes (increased from 15 minutes)
    refetchOnWindowFocus: false, // Prevents checks on tab focus
    retry: 0, // No retries to avoid cascading failures
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnMount: false, // Prevent automatic refetch on mount
  });
  
  // Update connection status from query cache
  useEffect(() => {
    if (connectionInfo !== undefined) {
      // Only update if needed to avoid re-renders
      if (connectionStatus !== connectionInfo) {
        setConnectionStatus(connectionInfo);
        if (onConnectionChange) onConnectionChange(connectionInfo);
      }
    }
  }, [connectionInfo, connectionStatus, onConnectionChange]);
  
  // Only check connection once on mount - not on every render
  useEffect(() => {
    if (user?.id) {
      const now = Date.now();
      const lastCheck = parseInt(localStorage.getItem('gmail_connection_timestamp') || '0', 10);
      
      // Only check if sufficient time has passed since last check
      if (now - lastCheck >= minimumCheckInterval) {
        silentCheckConnection().catch(err => {
          console.error("Background connection check failed:", err);
        });
      }
    }
  }, [user?.id, silentCheckConnection, minimumCheckInterval]);
  
  // Force refresh with throttling
  const forceRefresh = useCallback(async () => {
    if (!user) return false;
    
    const now = Date.now();
    if (now - lastCheckTime < minimumCheckInterval) {
      console.log(`Throttled force refresh (${Math.round((now - lastCheckTime)/1000)}s < ${minimumCheckInterval/1000}s)`);
      return connectionStatus ?? false;
    }
    
    setLastCheckTime(now);
    
    try {
      // Use small timeout to prevent UI flicker
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
      }, 100);
      
      return await checkConnection();
    } catch (error) {
      console.error("Error in forceRefresh:", error);
      return connectionStatus ?? false;
    }
  }, [user, queryClient, checkConnection, connectionStatus, lastCheckTime, minimumCheckInterval]);

  return {
    isConnected: connectionStatus ?? false,
    isLoading,
    configError: apiError?.message,
    connectGmail,
    disconnectGmail, 
    checkGmailConnection: throttledCheckConnection,
    silentCheckConnection,
    refreshGmailToken,
    forceRefresh,
    clearError
  };
};
