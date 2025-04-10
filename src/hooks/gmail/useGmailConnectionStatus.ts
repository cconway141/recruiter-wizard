
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface UseGmailConnectionStatusProps {
  onConnectionChange?: (connected: boolean) => void;
}

export const useGmailConnectionStatus = ({ onConnectionChange }: UseGmailConnectionStatusProps = {}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Use React Query for state management and caching
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
          try {
            await refreshGmailToken();
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
          } catch (refreshError) {
            console.error("Error during token refresh:", refreshError);
            setErrorMessage("Failed to refresh token. Please reconnect your account.");
            return { connected: false, expired: true, hasRefreshToken: true };
          }
        }
        
        return data || { connected: false, expired: false };
      } catch (error: any) {
        console.error("Error in queryFn:", error);
        setErrorMessage(error.message || "Failed to check Gmail connection");
        // Return a safe default value instead of throwing
        return { connected: false, expired: false, hasRefreshToken: false };
      }
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
    retry: 1, // Limit retries to prevent flooding with requests
    // Provide a default fallback value if the query fails
    meta: {
      onError: () => {
        console.log("Fallback to disconnected state due to error");
      }
    }
  });

  useEffect(() => {
    if (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error checking Gmail connection";
      setErrorMessage(errorMsg);
    }
  }, [error]);

  // Update connection status, with safety guards
  useEffect(() => {
    try {
      const isConnected = !!connectionInfo?.connected && !connectionInfo?.expired;
      // Notify parent component of connection status changes
      if (onConnectionChange) {
        onConnectionChange(isConnected);
      }
    } catch (err) {
      console.error("Error in connection status effect:", err);
    }
  }, [connectionInfo, onConnectionChange]);

  const refreshGmailToken = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      console.log("Refreshing Gmail token...");
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'refresh-token',
          userId: user.id
        }
      });
      
      if (error) {
        console.error("Error refreshing Gmail token:", error);
        setErrorMessage("Failed to refresh Gmail token. Please reconnect your account.");
        return false;
      }
      
      console.log("Gmail token refreshed successfully");
      return true;
    } catch (error) {
      console.error("Error refreshing Gmail token:", error);
      setErrorMessage("Failed to refresh Gmail token. Please reconnect your account.");
      return false;
    }
  };

  const checkGmailConnection = async (): Promise<boolean> => {
    try {
      console.log("Explicitly checking Gmail connection...");
      // Invalidate the query to ensure we get fresh data
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
      }
      
      const result = await refetch();
      const isConnected = !!result.data?.connected && !result.data?.expired;
      
      console.log("Gmail connection check result:", isConnected);
      return isConnected;
    } catch (error) {
      console.error("Error checking Gmail connection:", error);
      return false;
    }
  };

  const forceRefresh = async () => {
    if (!user) return false;
    
    try {
      // Clear local connection cache and fetch fresh data
      queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
      return await checkGmailConnection();
    } catch (error) {
      console.error("Error in forceRefresh:", error);
      return false;
    }
  };

  return {
    isConnected: !!connectionInfo?.connected && !connectionInfo?.expired,
    isLoading,
    configError: errorMessage,
    checkGmailConnection,
    refreshGmailToken,
    forceRefresh
  };
};
