
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useGmailAuth = () => {
  const [isCheckingGmail, setIsCheckingGmail] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkGmailConnection();
    }
  }, [user]);

  const checkGmailConnection = async (): Promise<boolean> => {
    if (!user) {
      setErrorMessage("You must be logged in to use Gmail integration");
      return false;
    }
    
    try {
      setIsCheckingGmail(true);
      setErrorMessage(null);
      
      const { data, error } = await supabase.functions.invoke('google-auth/check-connection', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error("Error checking Gmail connection:", error);
        setErrorMessage("Failed to check Gmail connection");
        return false;
      }
      
      const isConnected = data.connected && !data.expired;
      setIsGmailConnected(isConnected);
      
      if (data.needsRefresh) {
        const refreshResult = await refreshGmailToken();
        return refreshResult;
      }
      
      return isConnected;
    } catch (error) {
      console.error("Error checking Gmail connection:", error);
      setErrorMessage("Failed to check Gmail connection");
      return false;
    } finally {
      setIsCheckingGmail(false);
    }
  };

  const refreshGmailToken = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase.functions.invoke('google-auth/refresh-token', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error("Error refreshing Gmail token:", error);
        setErrorMessage("Failed to refresh Gmail token. Please reconnect your account.");
        return false;
      }
      
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
