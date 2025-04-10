
import React, { useEffect, useState } from "react";
import { ConfigErrorButton } from "../ConfigErrorButton";

interface EmailConnectionAlertProps {
  isGmailConnected: boolean;
  errorMessage: string | null;
  onConnect: () => Promise<any>;
}

export const EmailConnectionAlert: React.FC<EmailConnectionAlertProps> = ({
  isGmailConnected,
  errorMessage,
  onConnect,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(isGmailConnected);
  
  // Enhanced connection status detection with multi-source checking
  useEffect(() => {
    // First check props (most recent)
    if (isGmailConnected) {
      console.log("Gmail connected based on props");
      setIsConnected(true);
      // Update cached status
      try {
        sessionStorage.setItem('gmail_connection_status', 'true');
        localStorage.setItem('gmail_connected', 'true');
      } catch (e) {
        console.warn("Failed to cache connection status:", e);
      }
      return;
    }
    
    // Then try to get connection status from storage
    const sessionStatus = sessionStorage.getItem('gmail_connection_status');
    const localStatus = localStorage.getItem('gmail_connected');
    const urlParam = new URLSearchParams(window.location.search).get('gmail_connected');
    
    if (sessionStatus === 'true' || localStatus === 'true' || urlParam === 'true') {
      console.log("Gmail connected based on cached status");
      setIsConnected(true);
      // Make sure both storage locations are updated
      try {
        sessionStorage.setItem('gmail_connection_status', 'true');
        localStorage.setItem('gmail_connected', 'true');
      } catch (e) {
        console.warn("Failed to cache connection status:", e);
      }
    } else {
      console.log("Gmail not connected based on any sources");
      setIsConnected(isGmailConnected);
    }
  }, [isGmailConnected]);

  // Debug values
  console.debug("EmailConnectionAlert state:", { 
    propsConnected: isGmailConnected, 
    stateConnected: isConnected,
    sessionStorage: sessionStorage.getItem('gmail_connection_status'),
    localStorage: localStorage.getItem('gmail_connected'),
    urlParam: new URLSearchParams(window.location.search).get('gmail_connected'),
    hasErrorMessage: !!errorMessage, 
    hasOnConnect: !!onConnect 
  });

  // If connected or cached state says connected, don't show the alert
  if ((isConnected || isGmailConnected) && !errorMessage) return null;
  
  // Improved connect handler with better error handling
  const handleConnect = async () => {
    console.debug("Connect button clicked in EmailConnectionAlert");
    if (!onConnect) {
      console.error("EmailConnectionAlert: onConnect function is not defined!");
      return;
    }
    
    try {
      console.debug("Calling onConnect function from EmailConnectionAlert");
      await onConnect();
      
      // Immediately update local state to prevent flickering
      setIsConnected(true);
      
      // Update cached status
      try {
        sessionStorage.setItem('gmail_connection_status', 'true');
        localStorage.setItem('gmail_connected', 'true');
      } catch (e) {
        console.warn("Failed to cache connection status:", e);
      }
    } catch (error) {
      console.error("Error in handleConnect:", error);
    }
  };

  return (
    <div className="bg-amber-100 border border-amber-300 rounded-md p-3 mb-4">
      {errorMessage && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-3">
          {errorMessage}
        </div>
      )}
      
      {!isConnected && !isGmailConnected && (
        <>
          <p className="text-amber-800 font-medium mb-2">Gmail connection required</p>
          <p className="text-amber-700 text-sm mb-3">
            You need to connect your Gmail account to send emails.
          </p>
          <div className="flex justify-end">
            <ConfigErrorButton
              isConnected={false}
              onClick={handleConnect}
              className="mt-2"
            />
          </div>
        </>
      )}
    </div>
  );
};
