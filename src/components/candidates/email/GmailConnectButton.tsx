
import React from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Check if Gmail is connected on component mount
  React.useEffect(() => {
    const checkGmailConnection = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('google-auth/check-connection', {
          body: { userId: user.id }
        });
        
        if (error) {
          console.error("Error checking Gmail connection:", error);
          return;
        }
        
        setIsConnected(data.connected && !data.expired);
        
        // If token is expired but we have a refresh token, refresh it
        if (data.needsRefresh) {
          await refreshToken();
        }
        
        // Notify parent component of connection status
        if (onConnectionChange) {
          onConnectionChange(data.connected && !data.expired);
        }
      } catch (error) {
        console.error("Error checking Gmail connection:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkGmailConnection();
  }, [user, onConnectionChange]);
  
  // Function to refresh the access token
  const refreshToken = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('google-auth/refresh-token', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error("Error refreshing token:", error);
        return false;
      }
      
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };
  
  // Function to handle Gmail connection
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
      setIsLoading(true);
      
      // Get the authorization URL
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
      
      // Open Google's OAuth consent screen
      window.location.href = data.url;
    } catch (error) {
      console.error("Error connecting Gmail:", error);
      toast({
        title: "Error",
        description: "Failed to connect Gmail. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to disconnect Gmail
  const disconnectGmail = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Call the edge function to revoke tokens
      const { error: revokeError } = await supabase.functions.invoke('google-auth/revoke-token', {
        body: { userId: user.id }
      });
      
      if (revokeError) {
        console.error("Error revoking token:", revokeError);
      }
      
      // Use the Supabase function to delete tokens from database
      // Cast parameters to correct type to fix TypeScript error
      const { error } = await supabase.rpc('delete_gmail_token', {
        user_id_param: user.id
      } as { user_id_param: string });
      
      if (error) {
        console.error("Error disconnecting Gmail:", error);
        toast({
          title: "Error",
          description: "Failed to disconnect Gmail. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setIsConnected(false);
      
      // Notify parent component
      if (onConnectionChange) {
        onConnectionChange(false);
      }
      
      toast({
        title: "Success",
        description: "Gmail disconnected successfully.",
      });
    } catch (error) {
      console.error("Error disconnecting Gmail:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect Gmail. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      type="button"
      variant={isConnected ? "default" : "outline"}
      className={`flex items-center gap-2 ${className}`}
      onClick={isConnected ? disconnectGmail : connectGmail}
      disabled={isLoading}
    >
      <Mail className="h-4 w-4" />
      {isLoading ? "Loading..." : isConnected ? "Gmail Connected" : "Connect Gmail"}
    </Button>
  );
};
