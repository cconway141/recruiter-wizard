
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface UseGmailConnectionStatusProps {
  onConnectionChange?: (connected: boolean) => void;
}

export const useGmailConnectionStatus = ({ onConnectionChange }: UseGmailConnectionStatusProps = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  
  const queryKey = user?.id ? ['gmail-connection', user.id] : ['gmail-connection'];
  
  // Check connection status on component mount
  useEffect(() => {
    if (user?.id) {
      console.log("Checking Gmail connection on useGmailConnectionStatus mount");
      checkGmailConnection();
    } else {
      setIsConnected(false);
      setIsLoading(false);
    }
  }, [user]);
  
  const checkGmailConnection = async () => {
    if (!user) {
      setIsConnected(false);
      setIsLoading(false);
      setConfigError(null);
      if (onConnectionChange) onConnectionChange(false);
      return false;
    }
    
    try {
      setIsLoading(true);
      setConfigError(null);
      
      console.log("Checking Gmail connection status for user:", user.id);
      
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'check-connection',
          userId: user.id
        }
      });
      
      if (error) {
        console.error("Error checking Gmail connection:", error);
        setConfigError("Failed to check connection status");
        setIsConnected(false);
        if (onConnectionChange) onConnectionChange(false);
        return false;
      }
      
      console.log("Gmail connection check response:", data);
      
      // If token is expired but we have a refresh token, try refreshing
      if (data.connected && data.expired && data.hasRefreshToken) {
        console.log("Gmail token is expired, attempting to refresh...");
        return await refreshGmailToken();
      }
      
      // Update connection state
      const isActuallyConnected = data.connected && !data.expired;
      console.log("Setting isConnected to:", isActuallyConnected);
      setIsConnected(isActuallyConnected);
      if (onConnectionChange) onConnectionChange(isActuallyConnected);
      return isActuallyConnected;
    } catch (err) {
      console.error("Error in checkGmailConnection:", err);
      setConfigError("Failed to check connection status");
      setIsConnected(false);
      if (onConnectionChange) onConnectionChange(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshGmailToken = async () => {
    if (!user) return false;
    
    try {
      console.log("Refreshing Gmail token for user:", user.id);
      
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'refresh-token',
          userId: user.id
        }
      });
      
      if (error) {
        console.error("Error refreshing Gmail token:", error);
        setIsConnected(false);
        if (onConnectionChange) onConnectionChange(false);
        return false;
      }
      
      console.log("Gmail token refresh result:", data);
      
      // Check connection again to update state
      const isStillConnected = await checkGmailConnection();
      return isStillConnected;
    } catch (err) {
      console.error("Error in refreshGmailToken:", err);
      setIsConnected(false);
      if (onConnectionChange) onConnectionChange(false);
      return false;
    }
  };
  
  const forceRefresh = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Clear local connection cache
      queryClient.invalidateQueries({ queryKey });
      
      // Check connection status directly
      const connected = await checkGmailConnection();
      
      console.log("Force refresh result:", connected);
      
      toast({
        title: connected ? "Gmail Connected" : "Gmail Not Connected",
        description: connected 
          ? "Your Gmail account is properly connected." 
          : "Your Gmail account is not connected. Please connect it to send emails.",
      });
      
      return connected;
    } catch (err) {
      console.error("Error in forceRefresh:", err);
      toast({
        title: "Error",
        description: "Failed to refresh Gmail connection status.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  console.log("Current connection status in useGmailConnectionStatus:", isConnected);
  
  return {
    isConnected,
    isLoading,
    configError,
    checkGmailConnection,
    refreshGmailToken,
    forceRefresh
  };
};
