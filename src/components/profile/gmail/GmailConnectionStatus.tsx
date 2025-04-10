
import React from "react";
import { MailCheck, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
  // Only show connected state, no loading states or errors
  if (isConnected) {
    return (
      <Alert className="bg-green-50 border-green-200 mb-4">
        <MailCheck className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-600">Gmail Connected</AlertTitle>
        <AlertDescription className="text-green-700">
          Your Gmail account is connected and ready to use.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Return null for any other state to avoid UI clutter
  return null;
};
