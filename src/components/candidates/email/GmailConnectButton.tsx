
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface GmailConnectButtonProps {
  onConnectionChange?: (connected: boolean) => void;
  className?: string;
}

export const GmailConnectButton: React.FC<GmailConnectButtonProps> = ({ 
  onConnectionChange,
  className 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [configError, setConfigError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Use React Query to manage the connection state and provide automatic refetching
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
        
        // Notify parent component of connection status change if needed
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
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes to check token validity
    staleTime: 30 * 1000 // Consider data stale after 30 seconds
  });
  
  const isConnected = connectionStatus?.connected && !connectionStatus?.expired;
  
  // Effect to notify parent of connection changes
  useEffect(() => {
    if (onConnectionChange && connectionStatus) {
      onConnectionChange(connectionStatus.connected && !connectionStatus.expired);
    }
  }, [connectionStatus, onConnectionChange]);
  
  const refreshToken = async () => {
    if (!user) return false;
    
    try {
      console.log("Refreshing token...");
      const { data, error } = await supabase.functions.invoke('google-auth/refresh-token', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error("Error refreshing token:", error);
        toast({
          title: "Connection Error",
          description: "Failed to refresh Gmail token. Please reconnect your account.",
          variant: "destructive",
        });
        return false;
      }
      
      console.log("Token refreshed successfully");
      await refetch(); // Refetch connection status after refreshing token
      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };
  
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
  
  if (configError) {
    return (
      <Button
        type="button"
        variant="outline"
        className={`flex items-center gap-2 ${className}`}
        disabled={true}
      >
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="text-red-500">Gmail Setup Required</span>
      </Button>
    );
  }
  
  // Handle loading state and different connection states
  return (
    <Button
      type="button"
      variant={isConnected ? "default" : "outline"}
      className={`flex items-center gap-2 ${className}`}
      onClick={isConnected ? disconnectGmail : connectGmail}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Checking...</span>
        </>
      ) : isConnected ? (
        <>
          <Mail className="h-4 w-4" />
          <span>Gmail Connected</span>
        </>
      ) : (
        <>
          <Mail className="h-4 w-4" />
          <span>Connect Gmail</span>
        </>
      )}
    </Button>
  );
};
