
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
// Updated import with the correct hook from our new structure
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
  // Use the combined hook that provides all Gmail functionality
  const { 
    isConnected: isGmailConnected, 
    isLoading: isCheckingGmail,
    connectGmail,
    disconnectGmail
  } = useGmailConnection({ onConnectionChange });
  const { toast } = useToast();

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

  return (
    <ConfigErrorButton
      isConnected={isGmailConnected}
      onClick={connectGmail}
      onDisconnect={disconnectGmail}
      className={className}
    />
  );
};
