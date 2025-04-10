
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGmailConnection } from "@/hooks/gmail";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useGmailCardState = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [connectionAttemptTime, setConnectionAttemptTime] = useState<number | null>(null);
  const [errorOccurred, setErrorOccurred] = useState(false);
  
  // Use the combined hook that provides all Gmail functionality
  const { 
    isConnected: isGmailConnected, 
    isLoading: isCheckingGmail, 
    configError: errorMessage, 
    checkGmailConnection,
    disconnectGmail,
    forceRefresh
  } = useGmailConnection();
  
  useEffect(() => {
    try {
      const connectionInProgress = sessionStorage.getItem('gmailConnectionInProgress');
      const attemptTimeStr = sessionStorage.getItem('gmailConnectionAttemptTime');
      
      if (connectionInProgress === 'true' && attemptTimeStr) {
        const attemptTime = parseInt(attemptTimeStr, 10);
        setConnectionAttemptTime(attemptTime);
        
        if (Date.now() - attemptTime > 5 * 60 * 1000) {
          sessionStorage.removeItem('gmailConnectionInProgress');
          sessionStorage.removeItem('gmailConnectionAttemptTime');
          setConnectionAttemptTime(null);
        } else {
          if (user?.id) {
            console.log("Connection was in progress, forcing refresh...");
            queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
            
            toast({
              title: "Checking connection status",
              description: "Verifying Gmail API connection status...",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error in GmailCard useEffect:", error);
      setErrorOccurred(true);
    }
  }, [user, queryClient, toast]);
  
  // Separate the Gmail connection check to prevent crashes
  useEffect(() => {
    if (user?.id) {
      // Use setTimeout to defer the connection check after initial render
      const timer = setTimeout(() => {
        try {
          console.log("Checking Gmail connection on GmailCard mount");
          checkGmailConnection().catch(err => {
            console.error("Error checking Gmail connection:", err);
            setErrorOccurred(true);
          });
        } catch (error) {
          console.error("Error in Gmail check effect:", error);
          setErrorOccurred(true);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user?.id, checkGmailConnection]);
  
  const handleDisconnectGmail = async () => {
    try {
      // Show loading toast
      toast({
        title: "Disconnecting Gmail",
        description: "Please wait while we disconnect your Gmail account...",
      });
      
      // Call the disconnect function from our hook
      await disconnectGmail();
      
      // Clear any connection flags that might be in session storage
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      setConnectionAttemptTime(null);
      
      // Force refresh connection status
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
      }
    } catch (error) {
      console.error("Error disconnecting Gmail:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect Gmail. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const forceRefreshGmailStatus = () => {
    try {
      if (user?.id) {
        console.log("Manually refreshing Gmail connection status");
        toast({
          title: "Refreshing",
          description: "Checking Gmail connection status...",
        });
        
        queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
        
        sessionStorage.removeItem('gmailConnectionInProgress');
        sessionStorage.removeItem('gmailConnectionAttemptTime');
        setConnectionAttemptTime(null);
        
        checkGmailConnection().catch(err => {
          console.error("Error checking Gmail connection:", err);
          setErrorOccurred(true);
        });
      }
    } catch (error) {
      console.error("Error refreshing Gmail status:", error);
      toast({
        title: "Error",
        description: "Failed to refresh connection status",
        variant: "destructive"
      });
      setErrorOccurred(true);
    }
  };
  
  const showPendingAlert = connectionAttemptTime && (Date.now() - connectionAttemptTime > 30 * 1000);

  return {
    isGmailConnected,
    isCheckingGmail,
    errorMessage,
    errorOccurred,
    showPendingAlert,
    handleDisconnectGmail,
    forceRefreshGmailStatus
  };
};
