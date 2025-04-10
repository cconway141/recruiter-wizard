
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
  
  // Check for cached connection status from session/local storage
  useEffect(() => {
    // Try to get connection status from storage
    const sessionStatus = sessionStorage.getItem('gmail_connection_status');
    const localStatus = localStorage.getItem('gmail_connected');
    
    if (sessionStatus === 'true' || localStatus === 'true') {
      console.log("Using cached Gmail connection status: connected");
      setIsConnected(true);
    } else {
      setIsConnected(isGmailConnected);
    }
  }, [isGmailConnected]);

  console.debug("EmailConnectionAlert rendered:", { 
    isGmailConnected, 
    isConnected,
    hasErrorMessage: !!errorMessage, 
    hasOnConnect: !!onConnect 
  });

  // If connected or cached state says connected, don't show the alert
  if ((isConnected || isGmailConnected) && !errorMessage) return null;
  
  // Add a wrapper function with debugging
  const handleConnect = () => {
    console.debug("Connect button clicked in EmailConnectionAlert");
    if (onConnect) {
      console.debug("Calling onConnect function from EmailConnectionAlert");
      onConnect();
    } else {
      console.error("EmailConnectionAlert: onConnect function is not defined!");
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
              onClick={handleConnect} // Using our wrapper function
              className="mt-2"
            />
          </div>
        </>
      )}
    </div>
  );
};
