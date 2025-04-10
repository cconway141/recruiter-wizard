
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
 * Uses React Query for caching and state management
 */
export const useGmailConnection = ({
  onConnectionChange,
  showLoadingUI = true
}: UseGmailConnectionProps = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  
  // Use our unified Gmail API hook
  const {
    isLoading,
    error: apiError,
    clearError,
    checkConnection,
    silentCheckConnection,
    connectGmail,
    disconnectGmail,
    refreshToken: refreshGmailToken
  } = useGmailApi({
    showLoadingUI,
    onConnectionChange: (connected) => {
      setConnectionStatus(connected);
      if (onConnectionChange) onConnectionChange(connected);
    }
  });
  
  // Use React Query for connection state caching
  const { data: connectionInfo } = useQuery({
    queryKey: ['gmail-connection', user?.id],
    queryFn: async () => {
      const isConnected = await silentCheckConnection();
      return { connected: isConnected };
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    gcTime: 60 * 60 * 1000, // 1 hour
  });
  
  // Use connection info from query when available
  useEffect(() => {
    if (connectionInfo !== undefined) {
      const isConnected = !!connectionInfo?.connected;
      setConnectionStatus(isConnected);
      if (onConnectionChange) onConnectionChange(isConnected);
    }
  }, [connectionInfo, onConnectionChange]);
  
  // Force refresh connection status
  const forceRefresh = useCallback(async () => {
    if (!user) return false;
    
    queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
    return checkConnection();
  }, [user, queryClient, checkConnection]);
  
  // Check connection on mount
  useEffect(() => {
    if (user?.id) {
      silentCheckConnection().catch(err => {
        console.error("Background connection check failed:", err);
      });
    }
  }, [user?.id, silentCheckConnection]);
  
  return {
    isConnected: connectionStatus ?? false,
    isLoading,
    configError: apiError?.message,
    connectGmail,
    disconnectGmail,
    checkGmailConnection: checkConnection,
    silentCheckConnection,
    refreshGmailToken,
    forceRefresh,
    clearError
  };
};
