
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
  const minimumCheckInterval = 5 * 60 * 1000; // 5 minutes between connection checks (increased from 30s)
  
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
  
  // Use session storage for caching connection status
  const CONNECTION_KEY = 'gmail_connection_status';
  const CONNECTION_TIMESTAMP_KEY = 'gmail_connection_check_time';
  
  // Get cached status from session storage
  const getCachedStatus = useCallback(() => {
    try {
      const cached = sessionStorage.getItem(CONNECTION_KEY);
      const timestamp = sessionStorage.getItem(CONNECTION_TIMESTAMP_KEY);
      
      if (cached && timestamp) {
        const now = Date.now();
        const cacheTime = parseInt(timestamp);
        
        // Only use cache if it's less than 30 minutes old
        if (now - cacheTime < 30 * 60 * 1000) {
          console.log("Using cached Gmail connection status from session storage");
          return cached === 'true';
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }, []);
  
  // Set cached status in session storage
  const setCachedStatus = useCallback((status: boolean) => {
    try {
      sessionStorage.setItem(CONNECTION_KEY, status.toString());
      sessionStorage.setItem(CONNECTION_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
      console.log("Error caching connection status:", e);
    }
  }, []);
  
  // Heavily throttled connection check to prevent excessive API calls
  const throttledCheckConnection = useCallback(async () => {
    const now = Date.now();
    
    // First check session storage cache
    const cachedStatus = getCachedStatus();
    if (cachedStatus !== null) {
      return cachedStatus;
    }
    
    // Next, check if we already have cached data we can use
    const cachedData = queryClient.getQueryData(['gmail-connection', user?.id]);
    
    if (now - lastCheckTime < minimumCheckInterval) {
      console.log(`Throttled Gmail connection check (${Math.round((now - lastCheckTime)/1000)}s < ${minimumCheckInterval/1000}s)`);
      return connectionStatus ?? false;
    }
    
    console.log("Performing actual Gmail connection check");
    setLastCheckTime(now);
    
    try {
      const status = await silentCheckConnection();
      setCachedStatus(status);
      return status;
    } catch (err) {
      console.log("Error in throttled check:", err);
      return connectionStatus ?? false;
    }
  }, [connectionStatus, lastCheckTime, silentCheckConnection, user?.id, queryClient, getCachedStatus, setCachedStatus]);
  
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
      // Clear cache on disconnect
      sessionStorage.removeItem(CONNECTION_KEY);
      sessionStorage.removeItem(CONNECTION_TIMESTAMP_KEY);
      
      return await apiDisconnectGmail();
    } catch (error) {
      console.error("Error in disconnectGmail:", error);
      return false;
    }
  }, [apiDisconnectGmail, CONNECTION_KEY, CONNECTION_TIMESTAMP_KEY]);
  
  // Use React Query for connection state caching with massively improved performance settings
  const { data: connectionInfo } = useQuery({
    queryKey: ['gmail-connection', user?.id],
    queryFn: throttledCheckConnection,
    enabled: !!user,
    staleTime: 2 * 60 * 60 * 1000, // 2 hours - drastically reduced frequency
    refetchInterval: 4 * 60 * 60 * 1000, // 4 hours - drastically reduced polling
    refetchOnWindowFocus: false,
    retry: 0, // No retries to avoid cascading failures
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache much longer
    refetchOnMount: false, // Don't check on every mount
  });
  
  // Use connection info from query when available
  useEffect(() => {
    if (connectionInfo !== undefined) {
      // Only update if there's an actual change to avoid re-renders
      if (connectionStatus !== connectionInfo) {
        setConnectionStatus(connectionInfo);
        // Update cache
        setCachedStatus(connectionInfo);
        if (onConnectionChange) onConnectionChange(connectionInfo);
      }
    }
  }, [connectionInfo, connectionStatus, onConnectionChange, setCachedStatus]);
  
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
      // Clear session storage cache to ensure fresh check
      sessionStorage.removeItem(CONNECTION_KEY);
      sessionStorage.removeItem(CONNECTION_TIMESTAMP_KEY);
      
      // Don't immediately invalidate - use a small timeout
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
      }, 100);
      
      const status = await checkConnection();
      setCachedStatus(status);
      return status;
    } catch (error) {
      console.error("Error in forceRefresh:", error);
      return connectionStatus ?? false;
    }
  }, [user, queryClient, checkConnection, connectionStatus, lastCheckTime, CONNECTION_KEY, CONNECTION_TIMESTAMP_KEY, setCachedStatus]);
  
  // Only check connection once on mount - not on every render
  useEffect(() => {
    if (user?.id) {
      // Check if we have a cached status first
      const cachedStatus = getCachedStatus();
      if (cachedStatus !== null) {
        setConnectionStatus(cachedStatus);
        if (onConnectionChange) onConnectionChange(cachedStatus);
      } else {
        // Use throttled check to prevent excessive API calls
        const now = Date.now();
        if (now - lastCheckTime >= minimumCheckInterval) {
          setLastCheckTime(now);
          silentCheckConnection().then(status => {
            setCachedStatus(status);
          }).catch(err => {
            console.error("Background connection check failed:", err);
          });
        }
      }
    }
  }, [user?.id, silentCheckConnection, lastCheckTime, minimumCheckInterval, getCachedStatus, onConnectionChange, setCachedStatus]);
  
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
