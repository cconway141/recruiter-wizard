
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
        throw new Error("You must be logged in to use Gmail integration");
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
          throw new Error("Failed to check Gmail connection");
        }
        
        if (data?.error === 'Configuration error') {
          throw new Error(data.message || 'Google OAuth is not properly configured');
        }
        
        // Log connection status for debugging
        console.log("Gmail connection status from API:", data);
        
        if (data.needsRefresh) {
          console.log("Gmail token needs refresh, refreshing...");
          await refreshGmailToken();
          // Re-fetch after refresh
          const refreshResult = await supabase.functions.invoke('google-auth', {
            body: { action: 'check-connection', userId: user.id }
          });
          
          if (refreshResult.error) {
            console.error("Error after refreshing token:", refreshResult.error);
            throw new Error("Failed to verify refreshed connection");
          }
          
          return refreshResult.data;
        }
        
        return data;
      } catch (error: any) {
        console.error("Error in queryFn:", error);
        setErrorMessage(error.message || "Failed to check Gmail connection");
        throw error;
      }
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
    retry: 1, // Limit retries to prevent flooding with requests
  });

  useEffect(() => {
    if (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error checking Gmail connection";
      setErrorMessage(errorMsg);
    }
  }, [error]);

  // Update connection status
  useEffect(() => {
    const isConnected = connectionInfo?.connected && !connectionInfo?.expired;
    // Notify parent component of connection status changes
    if (onConnectionChange) {
      onConnectionChange(isConnected);
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
      queryClient.invalidateQueries({ queryKey: ['gmail-connection', user?.id] });
      
      const result = await refetch();
      const isConnected = result.data?.connected && !result.data?.expired;
      
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
      queryClient.invalidateQueries({ queryKey: ['gmail-connection', user?.id] });
      return await checkGmailConnection();
    } catch (error) {
      console.error("Error in forceRefresh:", error);
      return false;
    }
  };

  return {
    isConnected: connectionInfo?.connected && !connectionInfo?.expired,
    isLoading,
    configError: errorMessage,
    checkGmailConnection,
    refreshGmailToken,
    forceRefresh
  };
};
