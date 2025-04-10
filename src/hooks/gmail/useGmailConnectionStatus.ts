
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
  
  // Significantly increased throttling to reduce API calls
  const lastCheckRef = useRef<number>(0);
  const checkThrottleMs = 5 * 60 * 1000; // 5 minutes minimum between checks (increased from 30s)
  const maxErrorsBeforeBackoff = 2;
  const errorCountRef = useRef<number>(0);
  const backoffActiveRef = useRef<boolean>(false);
  const backoffTimeMs = 10 * 60 * 1000; // 10 minutes of backoff time (increased from 2 min)

  // Session storage key for caching
  const CONNECTION_CACHE_KEY = 'gmail_connection_cache';
  const CACHE_EXPIRY_KEY = 'gmail_connection_cache_expiry';

  // Cache-first throttled check with drastically reduced API calls
  const throttledCheck = async () => {
    const now = Date.now();
    
    // First check session storage cache to avoid API calls entirely
    try {
      const cachedExpiry = sessionStorage.getItem(CACHE_EXPIRY_KEY);
      const cachedData = sessionStorage.getItem(CONNECTION_CACHE_KEY);
      
      if (cachedExpiry && cachedData && parseInt(cachedExpiry) > now) {
        console.log("Using cached Gmail connection data from session storage");
        return JSON.parse(cachedData);
      }
    } catch (err) {
      console.log("Error reading from cache:", err);
    }
    
    // Try to get from React Query cache first
    const cachedData = queryClient.getQueryData(['gmail-connection', user?.id]);
    
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
    
    // Clear previous errors
    setConnectionError(null);
    setRefreshError(null);
    setErrorMessage(null);
    
    try {
      // Use correct method to call the edge function with query params
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'check-connection',
          userId: user?.id || ''
        }
      });
      
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
        data.connected = true;
        data.expired = false;
      }
      
      // Store successful result in session storage to reduce future API calls
      try {
        const cacheExpiry = now + (30 * 60 * 1000); // 30 minutes cache
        sessionStorage.setItem(CACHE_EXPIRY_KEY, cacheExpiry.toString());
        sessionStorage.setItem(CONNECTION_CACHE_KEY, JSON.stringify(data || { connected: false, expired: false }));
      } catch (err) {
        console.log("Error writing to cache:", err);
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
    }
  };

  // Use React Query with drastically improved cache strategy
  const { 
    data: connectionInfo,
    isLoading,
    refetch,
    error
  } = useQuery({
    queryKey: ['gmail-connection', user?.id],
    queryFn: throttledCheck,
    enabled: !!user,
    // Drastically increased caching parameters to reduce API calls
    staleTime: 60 * 60 * 1000, // 1 hour - keeps data fresh much longer
    refetchInterval: 2 * 60 * 60 * 1000, // 2 hours - very infrequent background checks
    refetchOnWindowFocus: false, // Prevents checks when tab regains focus
    retry: 0, // No retries to avoid cascading failures
    gcTime: 4 * 60 * 60 * 1000, // 4 hours to keep in cache
    refetchOnMount: false, // Don't refetch when component mounts
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
    } catch (err) {
      console.error("Error in connection status effect:", err);
    }
  }, [connectionInfo, onConnectionChange]);

  const forceRefresh = async () => {
    if (!user) return false;
    
    try {
      // Clear session storage cache to force a fresh check
      sessionStorage.removeItem(CONNECTION_CACHE_KEY);
      sessionStorage.removeItem(CACHE_EXPIRY_KEY);
      
      // Reset the last check time to force a real check
      lastCheckRef.current = 0;
      
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
    isConnected: !!connectionInfo?.connected && !connectionInfo?.expired,
    isLoading: skipLoading ? false : isLoading,
    isExpired: !!connectionInfo?.expired,
    errorMessage,
    hasRefreshToken: !!connectionInfo?.hasRefreshToken,
    forceRefresh
  };
};
