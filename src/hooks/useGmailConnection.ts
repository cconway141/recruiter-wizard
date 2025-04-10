import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface UseGmailConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
}

interface GmailConnectionResult {
  redirectUri?: string;
  url?: string;
  clientId?: string;
}

export const useGmailConnection = ({ onConnectionChange }: UseGmailConnectionProps = {}) => {
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
      console.log("Checking Gmail connection on useGmailConnection mount");
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
  
  const disconnectGmail = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // First revoke the token through the Google API
      const { error: revokeError } = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'revoke-token',
          userId: user.id
        }
      });
      
      if (revokeError) {
        console.error("Error revoking Gmail token:", revokeError);
      }
      
      // Then delete the token from our database
      const { error: deleteError } = await supabase
        .from('gmail_tokens')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) {
        console.error("Error deleting Gmail token:", deleteError);
        toast({
          title: "Error",
          description: "Failed to completely disconnect Gmail. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Gmail Disconnected",
          description: "Your Gmail account has been disconnected.",
        });
        
        // Update state
        setIsConnected(false);
        if (onConnectionChange) onConnectionChange(false);
        
        // Invalidate the query cache
        queryClient.invalidateQueries({ queryKey });
      }
    } catch (err) {
      console.error("Error in disconnectGmail:", err);
      toast({
        title: "Error",
        description: "Failed to disconnect Gmail. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
  
  const connectGmail = async (): Promise<GmailConnectionResult | null> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect your Gmail account.",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      setIsLoading(true);
      
      // Check if already connected
      const isAlreadyConnected = await checkGmailConnection();
      
      if (isAlreadyConnected) {
        toast({
          title: "Already Connected",
          description: "Your Gmail account is already connected.",
        });
        return null;
      }
      
      console.log("Initiating Gmail connection for user:", user.id);
      
      // Get the auth URL from our backend
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'get-auth-url',
          userId: user.id
        }
      });
      
      if (error) {
        console.error("Error getting Gmail auth URL:", error);
        throw new Error(error.message || "Failed to start Gmail connection");
      }
      
      if (!data || !data.url) {
        console.error("No auth URL returned from function:", data);
        throw new Error("Failed to generate authentication URL");
      }
      
      console.log("Received auth URL:", data.url.substring(0, 50) + "...");
      console.log("Redirect URI:", data.redirectUri);
      
      // Set flags in session storage to indicate connection in progress
      sessionStorage.setItem('gmailConnectionInProgress', 'true');
      sessionStorage.setItem('gmailConnectionAttemptTime', Date.now().toString());
      
      // Only redirect if we have a valid URL
      if (data.url) {
        // Redirect to Google's OAuth flow
        window.location.href = data.url;
      } else {
        console.error("No auth URL returned from the function");
        toast({
          title: "Error",
          description: "Failed to generate authentication URL.",
          variant: "destructive",
        });
        return null;
      }
      
      // Return the redirect URI for debugging
      return { 
        redirectUri: data.redirectUri,
        url: data.url,
        clientId: data.clientId
      };
    } catch (error) {
      console.error("Error connecting Gmail:", error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect Gmail",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  console.log("Current connection status in useGmailConnection:", isConnected);
  
  return {
    isConnected,
    isLoading,
    configError,
    connectGmail,
    disconnectGmail,
    checkGmailConnection,
    refreshGmailToken,
    forceRefresh
  };
};
