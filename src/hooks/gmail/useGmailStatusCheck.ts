
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useGmailStatusCheck = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();

  const checkGmailConnection = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      console.log("Explicitly checking Gmail connection...");
      
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'check-connection',
          userId: user.id
        }
      });
      
      if (error) {
        console.error("Error checking Gmail connection:", error);
        setErrorMessage("Failed to check Gmail connection");
        return false;
      }
      
      if (data?.error === 'Configuration error') {
        console.error("Configuration error:", data.message);
        setErrorMessage(data.message || "Missing Google API configuration");
        return false;
      }
      
      // Log connection status for debugging
      console.log("Gmail connection status from API:", data);
      
      const isConnected = !!data?.connected && !data?.expired;
      console.log("Gmail connection check result:", isConnected);
      
      return isConnected;
    } catch (error: any) {
      console.error("Error checking Gmail connection:", error);
      setErrorMessage(error.message || "Failed to check Gmail connection");
      return false;
    }
  };

  return {
    checkGmailConnection,
    connectionError: errorMessage,
    setConnectionError: setErrorMessage
  };
};
