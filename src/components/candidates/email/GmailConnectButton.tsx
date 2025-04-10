
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGmailConnection } from "@/hooks/gmail";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ConfigErrorButton } from "./ConfigErrorButton";

interface GmailConnectButtonProps {
  className?: string;
  onConnectionChange?: (connected: boolean) => void;
}

export const GmailConnectButton: React.FC<GmailConnectButtonProps> = ({ 
  className,
  onConnectionChange 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use our enhanced hook with explicit loading UI control
  const { 
    isConnected: isGmailConnected, 
    isLoading: isCheckingGmail,
    connectGmail,
    disconnectGmail
  } = useGmailConnection({ 
    onConnectionChange,
    showLoadingUI: false // Prevent blocking UI with loading states
  });

  // Improved logging for debugging
  console.debug("GmailConnectButton: Component rendered", { 
    isGmailConnected, 
    isCheckingGmail,
    connectGmailType: typeof connectGmail
  });

  // Notify parent component when connection status changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(isGmailConnected);
    }
  }, [isGmailConnected, onConnectionChange]);

  useEffect(() => {
    // Check if we just completed a connection process and clean up
    const urlParams = new URLSearchParams(window.location.search);
    const gmailConnected = urlParams.get('gmail_connected');
    
    if (gmailConnected === 'true') {
      // Clean URL without reloading the page
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Clear connection attempt flags
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      
      toast({
        title: "Gmail Connected",
        description: "Your Gmail account has been connected successfully!",
      });
      
      // Notify parent about successful connection
      if (onConnectionChange) {
        onConnectionChange(true);
      }
    } else if (gmailConnected === 'false') {
      // Clean URL without reloading the page
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Clear connection attempt flags
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Gmail. Please try again.",
        variant: "destructive",
      });
      
      // Notify parent about failed connection
      if (onConnectionChange) {
        onConnectionChange(false);
      }
    }
  }, [toast, onConnectionChange]);

  // Critical fix: Create a proper handleClick function with direct invocation of connectGmail
  const handleConnectClick = async () => {
    console.debug("Connect Gmail button clicked in GmailConnectButton");
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect your Gmail account.",
        variant: "destructive",
      });
      return;
    }
    
    if (!connectGmail) {
      console.error("connectGmail function is undefined");
      toast({
        title: "Error",
        description: "Gmail connection function is not available",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.debug("Executing connectGmail function");
      await connectGmail();
    } catch (error) {
      console.error("Error executing connectGmail:", error);
      // Clear connection flags in case of error
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      
      toast({
        title: "Connection Error",
        description: "Failed to initiate Gmail connection",
        variant: "destructive"
      });
    }
  };

  // Use ConfigErrorButton component with proper onClick handler for the connect button
  return (
    <ConfigErrorButton
      isConnected={isGmailConnected}
      onClick={handleConnectClick}
      onDisconnect={disconnectGmail}
      className={className}
    />
  );
};
