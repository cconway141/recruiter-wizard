
import React from "react";
import { MailCheck, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface GmailConnectionStatusProps {
  isConnected: boolean;
  isCheckingGmail: boolean;
  errorMessage: string | null;
  errorOccurred: boolean;
  showPendingAlert: boolean;
}

export const GmailConnectionStatus: React.FC<GmailConnectionStatusProps> = ({
  isConnected,
  isCheckingGmail,
  errorMessage,
  errorOccurred,
  showPendingAlert,
}) => {
  if (isCheckingGmail) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  return (
    <>
      {isConnected && (
        <Alert className="bg-green-50 border-green-200 mb-4">
          <MailCheck className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Gmail Connected</AlertTitle>
          <AlertDescription className="text-green-700">
            Your Gmail account is connected and ready to use.
          </AlertDescription>
        </Alert>
      )}
      
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {errorOccurred && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            There was a problem checking your Gmail connection status.
            Please try refreshing the status or reconnecting your account.
          </AlertDescription>
        </Alert>
      )}
      
      {showPendingAlert && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Pending</AlertTitle>
          <AlertDescription>
            A Gmail connection attempt is pending but hasn't completed. 
            If you started the connection process but haven't finished it, 
            please try again or refresh the status.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
