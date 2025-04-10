
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface UseGmailConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
}

export const useGmailConnection = ({ onConnectionChange }: UseGmailConnectionProps = {}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [configError, setConfigError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Query for checking Gmail connection status with more aggressive refreshing
  const { 
    data: connectionStatus, 
    isLoading, 
    refetch,
    isError
  } = useQuery({
    queryKey: ['gmail-connection', user?.id],
    queryFn: async () => {
      if (!user) return { connected: false, expired: false, needsRefresh: false };
      
      try {
        console.log("Checking Gmail connection for user:", user.id);
        setConfigError(null);
        const { data, error } = await supabase.functions.invoke('google-auth/check-connection', {
          body: { userId: user.id }
        });
        
        if (error) {
          console.error("Error checking Gmail connection:", error);
          throw error;
        }
        
        console.log("Connection status:", data.connected ? "Connected" : "Not connected");
        
        if (data?.error === 'Configuration error') {
          setConfigError(data.message || 'Google OAuth is not properly configured');
          return { connected: false, expired: false, needsRefresh: false };
        }
        
        // If token needs refresh, attempt to refresh it
        if (data.needsRefresh) {
          console.log("Token needs refresh, attempting refresh...");
          await refreshToken();
          // Re-fetch after refresh attempt
          const refreshResult = await supabase.functions.invoke('google-auth/check-connection', {
            body: { userId: user.id }
          });
          console.log("Refresh result:", refreshResult.data);
          return refreshResult.data;
        }
        
        // Notify of connection status change if needed
        if (onConnectionChange) {
          onConnectionChange(data.connected && !data.expired);
        }
        
        return data;
      } catch (error) {
        console.error("Error checking Gmail connection:", error);
        return { connected: false, expired: false, needsRefresh: false };
      }
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 1000, // Refetch every 5 seconds (more aggressive)
    staleTime: 2 * 1000 // Consider data stale after 2 seconds (more aggressive)
  });
  
  const isConnected = connectionStatus?.connected && !connectionStatus?.expired;
  
  // Refresh token function with retry logic
  const refreshToken = async () => {
    if (!user) return false;
    
    try {
      console.log("Refreshing token...");
      
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const { data, error } = await supabase.functions.invoke('google-auth/refresh-token', {
            body: { userId: user.id }
          });
          
          if (error) {
            console.error(`Attempt ${retryCount + 1}: Error refreshing token:`, error);
            throw error;
          }
          
          console.log(`Attempt ${retryCount + 1}: Token refreshed successfully`);
          await refetch(); // Refetch connection status after refreshing token
          return true;
        } catch (retryError) {
          console.error(`Refresh attempt ${retryCount + 1} failed:`, retryError);
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`Retrying token refresh in 1 second... (${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      console.error(`Failed to refresh token after ${maxRetries} attempts`);
      toast({
        title: "Connection Error",
        description: "Failed to refresh Gmail token after multiple attempts. Please reconnect your account.",
        variant: "destructive",
      });
      
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };
  
  // Connect Gmail function with better error handling
  const connectGmail = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect your Gmail account.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setConfigError(null);
      
      console.log("Getting auth URL for user:", user.id);
      const { data, error } = await supabase.functions.invoke('google-auth/get-auth-url', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error("Error getting auth URL:", error);
        toast({
          title: "Error",
          description: "Failed to initiate Gmail connection.",
          variant: "destructive",
        });
        return;
      }
      
      if (data?.error === 'Configuration error') {
        setConfigError(data.message || 'Google OAuth is not properly configured');
        toast({
          title: "Configuration Error",
          description: "Gmail integration is not properly configured. Please contact the administrator.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Generated auth URL:", data.url);
      
      // Store a flag in sessionStorage to identify that we're in the process of connecting Gmail
      sessionStorage.setItem('gmailConnectionInProgress', 'true');
      
      // Redirect to Google's OAuth flow
      window.location.href = data.url;
    } catch (error) {
      console.error("Error connecting Gmail:", error);
      toast({
        title: "Error",
        description: "Failed to connect Gmail. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Disconnect Gmail function with better error handling
  const disconnectGmail = async () => {
    if (!user) return;
    
    try {
      console.log("Disconnecting Gmail for user:", user.id);
      
      // First revoke the token via the edge function
      const { error: revokeError } = await supabase.functions.invoke('google-auth/revoke-token', {
        body: { userId: user.id }
      });
      
      if (revokeError) {
        console.error("Error revoking token:", revokeError);
      }
      
      // Then delete the token from the database using the RPC function
      const { error } = await supabase.rpc('delete_gmail_token', {
        user_id_param: user.id
      });
      
      if (error) {
        console.error("Error disconnecting Gmail:", error);
        toast({
          title: "Error",
          description: "Failed to disconnect Gmail. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Notify parent component of connection status change if needed
      if (onConnectionChange) {
        onConnectionChange(false);
      }
      
      toast({
        title: "Success",
        description: "Gmail disconnected successfully.",
      });
      
      // Invalidate all gmail-related queries
      queryClient.invalidateQueries({ queryKey: ['gmail-connection'] });
      
      await refetch(); // Refetch to update the connection status
    } catch (error) {
      console.error("Error disconnecting Gmail:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect Gmail. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Force refresh Gmail connection status
  const forceRefresh = () => {
    console.log("Forcing refresh of Gmail connection status");
    queryClient.invalidateQueries({ queryKey: ['gmail-connection', user?.id] });
    refetch();
  };

  return {
    isConnected,
    isLoading,
    configError,
    connectGmail,
    disconnectGmail,
    forceRefresh,
    refreshToken
  };
};
