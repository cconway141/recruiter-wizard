
import { useState, useEffect } from "react";
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

  // Use React Query for state management and caching with significantly improved settings
  const { 
    data: connectionInfo,
    isLoading,
    refetch,
    error
  } = useQuery({
    queryKey: ['gmail-connection', user?.id],
    queryFn: async () => {
      if (!user) {
        return { connected: false, expired: false, hasRefreshToken: false };
      }
      
      // Clear previous errors
      setConnectionError(null);
      setRefreshError(null);
      setErrorMessage(null);
      
      console.log("Checking Gmail connection status for user:", user.id);
      
      try {
        const { data, error } = await supabase.functions.invoke('google-auth', {
          body: {
            action: 'check-connection',
            userId: user.id
          }
        });
        
        if (error) {
          console.error("Error checking Gmail connection:", error);
          setErrorMessage("Failed to check Gmail connection");
          return { connected: false, expired: false, hasRefreshToken: false };
        }
        
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
          
          // Re-fetch after refresh
          const refreshResult = await supabase.functions.invoke('google-auth', {
            body: { action: 'check-connection', userId: user.id }
          });
          
          if (refreshResult.error) {
            console.error("Error after refreshing token:", refreshResult.error);
            setErrorMessage("Failed to refresh token. Please reconnect your account.");
            return { connected: false, expired: true, hasRefreshToken: true };
          }
          
          return refreshResult.data || { connected: false, expired: false };
        }
        
        return data || { connected: false, expired: false };
      } catch (error: any) {
        console.error("Error in queryFn:", error);
        setErrorMessage(error.message || "Failed to check Gmail connection");
        return { connected: false, expired: false, hasRefreshToken: false };
      }
    },
    enabled: !!user,
    // Performance optimizations - significantly increased to reduce API calls
    staleTime: 10 * 60 * 1000, // 10 minutes - keeps data fresh longer
    refetchInterval: 30 * 60 * 1000, // 30 minutes - reduces background checks
    refetchOnWindowFocus: false, // Prevents checks when tab regains focus
    retry: 1, // Only retry once to avoid excessive requests
    gcTime: 60 * 60 * 1000, // 1 hour to keep in cache
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
