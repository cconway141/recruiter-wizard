
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useGmailAuth = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use React Query for better state management and caching
  const { 
    data: connectionInfo,
    isLoading: isCheckingGmail,
    refetch,
    error
  } = useQuery({
    queryKey: ['gmail-connection', user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error("You must be logged in to use Gmail integration");
      }
      
      setErrorMessage(null);
      
      console.log("Checking Gmail connection in useGmailAuth for user:", user.id);
      
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
      
      if (!data.connected || data.expired) {
        console.log("Gmail not connected or expired");
      } else {
        console.log("Gmail is connected and valid");
      }
      
      if (data.needsRefresh) {
        console.log("Gmail token needs refresh, refreshing...");
        await refreshGmailToken();
        // Re-fetch after refresh
        const { data: refreshedData } = await supabase.functions.invoke('google-auth', {
          body: { action: 'check-connection', userId: user.id }
        });
        return refreshedData;
      }
      
      return data;
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
    staleTime: 1 * 60 * 1000, // 1 minute - reduced to ensure more frequent checks
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });

  useEffect(() => {
    if (error) {
      setErrorMessage((error as Error).message);
    }
  }, [error]);

  // Set error message when connection fails
  useEffect(() => {
    if (!isCheckingGmail && !connectionInfo?.connected) {
      setErrorMessage("Gmail connection not established");
    } else {
      setErrorMessage(null);
    }
  }, [connectionInfo, isCheckingGmail]);

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

  console.log("Current Gmail connection status in hook:", connectionInfo?.connected && !connectionInfo?.expired);

  return {
    isGmailConnected: connectionInfo?.connected && !connectionInfo?.expired,
    isCheckingGmail,
    errorMessage,
    checkGmailConnection,
    refreshGmailToken
  };
};
