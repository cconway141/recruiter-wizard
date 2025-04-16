
import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGmailTokenRefresh } from "./useGmailTokenRefresh";
import { useGmailStatusCheck } from "./useGmailStatusCheck";

interface UseGmailConnectionStatusProps {
  onConnectionChange?: (connected: boolean) => void;
  skipLoading?: boolean; // Prop to skip loading states
}

export const useGmailConnectionStatus = ({ 
  onConnectionChange, 
  skipLoading = false 
}: UseGmailConnectionStatusProps = {}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { refreshGmailToken, setRefreshError } = useGmailTokenRefresh();
  const { checkGmailConnection, connectionError, setConnectionError } = useGmailStatusCheck();
  
  // Enhanced rate limiting with a significant timeout
  const lastCheckRef = useRef<number>(0);
  // Greatly increased throttle to 3 minutes
  const checkThrottleMs = 180000; // 3 minutes minimum between checks
  const maxErrorsBeforeBackoff = 2; // Threshold to activate backoff
  const errorCountRef = useRef<number>(0);
  const backoffActiveRef = useRef<boolean>(false);
  // Increased backoff time to 15 minutes
  const backoffTimeMs = 900000; // 15 minutes of backoff time
  
  // Add a check-in-progress flag to prevent simultaneous checks
  const checkInProgressRef = useRef<boolean>(false);
  
  // Add localStorage caching
  const cachedStatusKey = user?.id ? `gmail_connection_${user.id}` : null;
  
  // Check if we already have a cached status in localStorage
  const localStorageConnected = localStorage.getItem('gmail_connected') === 'true';
  
  // Function to get cached status
  const getCachedStatus = () => {
    // First, check simple localStorage flag
    if (localStorageConnected) {
      return { connected: true, expired: false, hasRefreshToken: true };
    }
    
    if (!cachedStatusKey) return null;
    
    try {
      const cachedData = localStorage.getItem(cachedStatusKey);
      if (!cachedData) return null;
      
      const parsed = JSON.parse(cachedData);
      const cacheAge = Date.now() - (parsed.timestamp || 0);
      
      // Use cache if it's less than 30 minutes old
      if (cacheAge < 1800000) { // 30 minutes
        console.log(`Using cached Gmail connection status (${Math.round(cacheAge/1000)}s old)`);
        return parsed.data;
      }
      
      // Cache is too old
      return null;
    } catch (err) {
      console.error("Error reading cached status:", err);
      return null;
    }
  };
  
  // Function to set cached status
  const setCachedStatus = (data: any) => {
    if (!cachedStatusKey) return;
    
    try {
      localStorage.setItem(cachedStatusKey, JSON.stringify({
        timestamp: Date.now(),
        data
      }));
      
      // Also set the simple flag for faster checks
      if (data?.connected && !data?.expired) {
        localStorage.setItem('gmail_connected', 'true');
      }
    } catch (err) {
      console.error("Error caching status:", err);
    }
  };

  // Rate limiting function with enhanced protection
  const throttledCheck = async () => {
    const now = Date.now();
    
    // Check simple localStorage flag first for fastest response
    if (localStorageConnected) {
      return { connected: true, expired: false, hasRefreshToken: true };
    }
    
    // Next, check detailed cached data
    const cachedData = getCachedStatus() || queryClient.getQueryData(['gmail-connection', user?.id]);
    
    // If a check is already in progress, use cached data
    if (checkInProgressRef.current) {
      console.log("Gmail connection check already in progress, using cached data");
      return cachedData || { connected: false, expired: false, hasRefreshToken: false };
    }
    
    // If we're in backoff mode due to repeated errors, use cached data
    if (backoffActiveRef.current) {
      console.log("Gmail connection check in backoff mode, using cached data");
      return cachedData || { connected: false, expired: false, hasRefreshToken: false };
    }
    
    // Enhanced throttling with much longer timeout
    if (now - lastCheckRef.current < checkThrottleMs) {
      console.log(`Gmail connection check throttled (${Math.round((now - lastCheckRef.current)/1000)}s < ${checkThrottleMs/1000}s), using cached data`);
      return cachedData || { connected: false, expired: false, hasRefreshToken: false };
    }
    
    // Only update the timestamp if we're actually making a request
    lastCheckRef.current = now;
    
    // Set check in progress flag
    checkInProgressRef.current = true;
    
    // Clear previous errors
    setConnectionError(null);
    setRefreshError(null);
    setErrorMessage(null);
    
    try {
      console.log("Performing actual Gmail connection check to Supabase");
      
      // Use correct method to call the edge function with query params
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'check-connection',
          userId: user?.id || ''
        }
      });
      
      // Cache the successful response
      if (!error && data && !data.error) {
        setCachedStatus(data);
      }
      
      // Reset error count on success
      errorCountRef.current = 0;
      backoffActiveRef.current = false;
      
      if (error) {
        throw new Error(`Server returned an error: ${error.message}`);
      }
      
      if (data?.error === 'Configuration error') {
        console.error("Configuration error:", data.message);
        setErrorMessage(data.message || "Missing Google API configuration");
        return { connected: false, expired: false, hasRefreshToken: false, configError: data.message };
      }
      
      // Simplified refresh flow - only refresh if absolutely needed
      if (data?.needsRefresh && data?.hasRefreshToken) {
        console.log("Gmail token needs refresh, refreshing...");
        const refreshSuccess = await refreshGmailToken();
        
        if (!refreshSuccess) {
          return { connected: false, expired: true, hasRefreshToken: true };
        }
        
        // Use simplified response after refresh
        return { connected: true, expired: false, hasRefreshToken: true };
      }
      
      return data || { connected: false, expired: false };
    } catch (error: any) {
      console.error("Error in throttledCheck:", error);
      
      // Increase error count and activate backoff with longer timeout
      errorCountRef.current += 1;
      
      if (errorCountRef.current >= maxErrorsBeforeBackoff) {
        console.log(`Activating backoff after ${errorCountRef.current} consecutive errors for ${backoffTimeMs/1000}s`);
        backoffActiveRef.current = true;
        
        // Reset backoff after the specified backoff time
        setTimeout(() => {
          console.log("Resetting connection check backoff");
          backoffActiveRef.current = false;
          errorCountRef.current = 0;
        }, backoffTimeMs);
      }
      
      setErrorMessage(error.message || "Failed to check Gmail connection");
      return { connected: false, expired: false, hasRefreshToken: false };
    } finally {
      // Always clear the check in progress flag
      checkInProgressRef.current = false;
    }
  };

  // Use React Query with significantly improved cache strategy
  const { 
    data: connectionInfo,
    isLoading,
    refetch,
    error
  } = useQuery({
    queryKey: ['gmail-connection', user?.id],
    queryFn: throttledCheck,
    enabled: !!user,
    // Significantly increased caching parameters to reduce API calls
    staleTime: 60 * 60 * 1000, // 60 minutes - keeps data fresh much longer
    refetchInterval: 120 * 60 * 1000, // 120 minutes - very infrequent background checks
    refetchOnWindowFocus: false, // Prevents checks when tab regains focus
    retry: 0, // No retries to avoid cascading failures
    gcTime: 180 * 60 * 1000, // 180 minutes to keep in cache
    refetchOnMount: false, // Prevents excess calls on component mounts
    initialData: getCachedStatus,
  });

  // Silently handle errors - no UI updates
  useEffect(() => {
    if (error) {
      console.error("Connection check error:", error);
      // Don't set UI error states to avoid blocking rendering
    }
  }, [error]);

  // Update connection status, with safety guards
  useEffect(() => {
    try {
      const isConnected = !!connectionInfo?.connected && !connectionInfo?.expired;
      if (onConnectionChange) {
        onConnectionChange(isConnected);
      }
      
      // Update localStorage status flag for consistent UI
      if (isConnected) {
        localStorage.setItem('gmail_connected', 'true');
      }
    } catch (err) {
      console.error("Error in connection status effect:", err);
    }
  }, [connectionInfo, onConnectionChange]);

  const forceRefresh = async () => {
    if (!user) return false;
    
    // Don't allow refresh if one is already in progress or if in backoff mode
    if (checkInProgressRef.current || backoffActiveRef.current) {
      console.log("Skipping force refresh due to active check or backoff");
      return false;
    }
    
    try {
      console.log("Forcing Gmail connection check refresh");
      
      // Clear cached status to ensure fresh check
      if (cachedStatusKey) {
        localStorage.removeItem(cachedStatusKey);
      }
      
      // Use a throttled invalidation to prevent UI flickering
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
        refetch();
      }, 0);
      
      return true;
    } catch (error) {
      console.error("Error in forceRefresh:", error);
      return false;
    }
  };

  return {
    isConnected: localStorageConnected || (!!connectionInfo?.connected && !connectionInfo?.expired),
    isLoading: skipLoading ? false : isLoading,
    isExpired: !!connectionInfo?.expired,
    errorMessage,
    hasRefreshToken: !!connectionInfo?.hasRefreshToken,
    forceRefresh
  };
};
