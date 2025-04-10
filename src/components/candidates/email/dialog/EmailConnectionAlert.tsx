
import React from "react";
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
  console.debug("EmailConnectionAlert rendered:", { 
    isGmailConnected, 
    hasErrorMessage: !!errorMessage, 
    hasOnConnect: !!onConnect 
  });

  if (isGmailConnected && !errorMessage) return null;
  
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
      
      {!isGmailConnected && (
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
