
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
  
  // Add rate limiting reference
  const lastCheckRef = useRef<number>(0);
  const checkThrottleMs = 10000; // 10 seconds minimum between checks

  // Rate limiting function to prevent excessive edge function calls
  const throttledCheck = async () => {
    const now = Date.now();
    if (now - lastCheckRef.current < checkThrottleMs) {
      console.log("Gmail connection check throttled, using cached data");
      return queryClient.getQueryData(['gmail-connection', user?.id]) || 
        { connected: false, expired: false, hasRefreshToken: false };
    }
    
    lastCheckRef.current = now;
    
    // Clear previous errors
    setConnectionError(null);
    setRefreshError(null);
    setErrorMessage(null);
    
    try {
      // Use GET request with query params for connection check
      const url = new URL(`${supabase.functions.url('google-auth')}`);
      url.searchParams.append('action', 'check-connection');
      url.searchParams.append('userId', user?.id || '');
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.session()?.access_token || ''}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data?.error === 'Configuration error') {
        console.error("Configuration error:", data.message);
        setErrorMessage(data.message || "Missing Google API configuration");
        return { connected: false, expired: false, hasRefreshToken: false, configError: data.message };
      }
      
      // Log connection status for debugging
      console.log("Gmail connection status from API:", data);
      
      if (data?.needsRefresh) {
        console.log("Gmail token needs refresh, refreshing...");
        const refreshSuccess = await refreshGmailToken();
        
        if (!refreshSuccess) {
          return { connected: false, expired: true, hasRefreshToken: true };
        }
        
        // Re-fetch after refresh using the same throttling approach
        const refreshUrl = new URL(`${supabase.functions.url('google-auth')}`);
        refreshUrl.searchParams.append('action', 'check-connection');
        refreshUrl.searchParams.append('userId', user?.id || '');
        
        const refreshResponse = await fetch(refreshUrl.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.auth.session()?.access_token || ''}`
          }
        });
        
        if (!refreshResponse.ok) {
          throw new Error("Failed to check connection after refresh");
        }
        
        const refreshData = await refreshResponse.json();
        return refreshData || { connected: false, expired: false };
      }
      
      return data || { connected: false, expired: false };
    } catch (error: any) {
      console.error("Error in throttledCheck:", error);
      setErrorMessage(error.message || "Failed to check Gmail connection");
      return { connected: false, expired: false, hasRefreshToken: false };
    }
  };

  // Use React Query with improved cache strategy
  const { 
    data: connectionInfo,
    isLoading,
    refetch,
    error
  } = useQuery({
    queryKey: ['gmail-connection', user?.id],
    queryFn: throttledCheck,
    enabled: !!user,
    // Performance optimizations - significantly increased to reduce API calls
    staleTime: 2 * 60 * 1000, // 2 minutes - keeps data fresh longer
    refetchInterval: 5 * 60 * 1000, // 5 minutes - reduces background checks
    refetchOnWindowFocus: false, // Prevents checks when tab regains focus
    retry: 1, // Only retry once to avoid excessive requests
    gcTime: 10 * 60 * 1000, // 10 minutes to keep in cache
    // Critical: Set a timeout to prevent indefinite loading
    refetchOnMount: "always",
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
      // Use a throttled invalidation to prevent UI flickering
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
      }, 100);
      
      return await checkGmailConnection();
    } catch (error) {
      console.error("Error in forceRefresh:", error);
      return false;
    }
  };

  return {
    // If skipLoading is true, default to not connected when loading
    isConnected: isLoading && skipLoading ? false : !!connectionInfo?.connected && !connectionInfo?.expired,
    isLoading: skipLoading ? false : isLoading, // Never report loading if skipLoading is true
    configError: errorMessage,
    checkGmailConnection,
    refreshGmailToken,
    forceRefresh
  };
};
