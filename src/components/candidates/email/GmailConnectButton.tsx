
import React from "react";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle, Loader2 } from "lucide-react";
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
  const [configError, setConfigError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const checkGmailConnection = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setConfigError(null);
        const { data, error } = await supabase.functions.invoke('google-auth/check-connection', {
          body: { userId: user.id }
        });
        
        if (error) {
          console.error("Error checking Gmail connection:", error);
          toast({
            title: "Error",
            description: "Failed to check Gmail connection status",
            variant: "destructive",
          });
          return;
        }
        
        if (data?.error === 'Configuration error') {
          setConfigError(data.message || 'Google OAuth is not properly configured');
          return;
        }
        
        const connected = data.connected && !data.expired && data.tokenPresent;
        setIsConnected(connected);
        
        if (data.needsRefresh) {
          console.log("Token needs refresh, refreshing...");
          await refreshToken();
        }
        
        if (onConnectionChange) {
          onConnectionChange(connected);
        }
      } catch (error) {
        console.error("Error checking Gmail connection:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkGmailConnection();
  }, [user, onConnectionChange, toast]);
  
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
          title: "Error",
          description: "Failed to refresh your Gmail token",
          variant: "destructive",
        });
        return false;
      }
      
      if (data?.error) {
        console.error("Error from refresh token endpoint:", data.error);
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return false;
      }
      
      console.log("Token refreshed successfully");
      setIsConnected(true);
      if (onConnectionChange) {
        onConnectionChange(true);
      }
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
      setIsLoading(true);
      setConfigError(null);
      
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
      
      console.log("Redirecting to Google auth:", data.url);
      toast({
        title: "Connecting to Gmail",
        description: "You will be redirected to Google to authorize access.",
      });
      
      // Redirect to Google auth page
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
  
  const disconnectGmail = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { error: revokeError } = await supabase.functions.invoke('google-auth/revoke-token', {
        body: { userId: user.id }
      });
      
      if (revokeError) {
        console.error("Error revoking token:", revokeError);
        toast({
          title: "Error",
          description: "Failed to revoke Gmail access. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      setIsConnected(false);
      
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
  
  return (
    <Button
      type="button"
      variant={isConnected ? "default" : "outline"}
      className={`flex items-center gap-2 ${className}`}
      onClick={isConnected ? disconnectGmail : connectGmail}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mail className="h-4 w-4" />
      )}
      {isLoading 
        ? "Loading..." 
        : isConnected 
          ? "Gmail Connected" 
          : "Connect Gmail"
      }
    </Button>
  );
};
