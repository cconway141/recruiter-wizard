
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useGmailAuth = () => {
  const [isCheckingGmail, setIsCheckingGmail] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkGmailConnection = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setErrorMessage("You must be logged in to use Gmail integration");
      setIsGmailConnected(false);
      return false;
    }
    
    try {
      setIsCheckingGmail(true);
      setErrorMessage(null);
      
      console.log("Checking Gmail connection for user:", user.id);
      
      const { data, error } = await supabase.functions.invoke('google-auth/check-connection', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error("Error checking Gmail connection:", error);
        setErrorMessage("Failed to check Gmail connection");
        setIsGmailConnected(false);
        return false;
      }
      
      if (data?.error === 'Configuration error') {
        setErrorMessage(data.message || 'Google OAuth is not properly configured');
        setIsGmailConnected(false);
        return false;
      }
      
      const isConnected = data.connected && !data.expired && data.tokenPresent;
      setIsGmailConnected(isConnected);
      
      if (!isConnected) {
        console.log("Gmail not connected or token expired");
      } else {
        console.log("Gmail is connected and token is valid");
      }
      
      if (data.needsRefresh) {
        console.log("Token needs refresh, refreshing...");
        const refreshResult = await refreshGmailToken();
        return refreshResult;
      }
      
      return isConnected;
    } catch (error) {
      console.error("Error checking Gmail connection:", error);
      setErrorMessage("Failed to check Gmail connection");
      setIsGmailConnected(false);
      return false;
    } finally {
      setIsCheckingGmail(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      checkGmailConnection().catch(console.error);
    } else {
      setIsGmailConnected(false);
    }
  }, [user, checkGmailConnection]);

  const refreshGmailToken = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      console.log("Refreshing Gmail token for user:", user.id);
      
      const { data, error } = await supabase.functions.invoke('google-auth/refresh-token', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error("Error refreshing Gmail token:", error);
        setErrorMessage("Failed to refresh Gmail token. Please reconnect your account.");
        return false;
      }
      
      if (data?.error) {
        console.error("Error from refresh token endpoint:", data.error);
        setErrorMessage(`Failed to refresh Gmail token: ${data.error}`);
        return false;
      }
      
      console.log("Token refreshed successfully");
      setIsGmailConnected(true);
      return true;
    } catch (error) {
      console.error("Error refreshing Gmail token:", error);
      setErrorMessage("Failed to refresh Gmail token. Please reconnect your account.");
      return false;
    }
  };

  return {
    isGmailConnected,
    isCheckingGmail,
    errorMessage,
    checkGmailConnection,
    refreshGmailToken
  };
};
