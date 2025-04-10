
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
  if (isGmailConnected && !errorMessage) return null;

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
              onClick={onConnect} // This ensures the connectGmail function is called on click
              className="mt-2"
            />
          </div>
        </>
      )}
    </div>
  );
};
