
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ConfigErrorButton } from "./ConfigErrorButton";
import { useGmailConnection } from "@/contexts/GmailConnectionContext";

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
  
  // Use our centralized context instead of the hook
  const { 
    isConnected, 
    isLoading,
    connectGmail,
    disconnectGmail,
    error
  } = useGmailConnection();

  // Improved logging for debugging
  console.debug("GmailConnectButton: Component rendered", { 
    isConnected, 
    isLoading,
    hasError: !!error,
    hasUser: !!user
  });

  // Notify parent component when connection status changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(isConnected);
    }
  }, [isConnected, onConnectionChange]);

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

  // Critical fix: Create a proper click handler function
  const handleConnectClick = () => {
    console.debug("Connect Gmail button clicked in GmailConnectButton");
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
      connectGmail().catch(error => {
        console.error("Error connecting to Gmail:", error);
      });
    } catch (error) {
      console.error("Error executing connectGmail:", error);
      toast({
        title: "Connection Error",
        description: "Failed to initiate Gmail connection",
        variant: "destructive"
      });
    }
  };

  return (
    <ConfigErrorButton
      isConnected={isConnected}
      onClick={handleConnectClick}
      onDisconnect={disconnectGmail}
      className={className}
      isLoading={isLoading}
    />
  );
};
