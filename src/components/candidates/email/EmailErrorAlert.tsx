
import React from "react";
import { AlertCircle, XCircle, InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface EmailErrorAlertProps {
  errorMessage: string | null;
  onGoToProfile?: () => void;
}

export const EmailErrorAlert: React.FC<EmailErrorAlertProps> = ({ 
  errorMessage, 
  onGoToProfile 
}) => {
  if (!errorMessage) return null;
  
  // Check for specific error messages to provide more helpful guidance
  let title = "Error";
  let icon = <XCircle className="h-4 w-4" />;
  let variant = "destructive";
  let isGmailError = false;
  
  if (errorMessage.includes("Gmail not connected") || errorMessage.includes("connect your Gmail")) {
    title = "Gmail Connection Required";
    icon = <InfoIcon className="h-4 w-4" />;
    variant = "default";
    isGmailError = true;
  } else if (errorMessage.includes("token expired")) {
    title = "Session Expired";
    icon = <AlertCircle className="h-4 w-4" />;
    variant = "default";
    isGmailError = true;
  }

  return (
    <Alert variant={variant as "default" | "destructive"}>
      {icon}
      <div className="flex justify-between items-start w-full">
        <div>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </div>
        
        {isGmailError && onGoToProfile && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onGoToProfile}
            className="ml-4 whitespace-nowrap"
          >
            Go to Profile
          </Button>
        )}
      </div>
    </Alert>
  );
};
