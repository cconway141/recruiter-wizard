
import React from "react";
import { AlertCircle, XCircle, InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EmailErrorAlertProps {
  errorMessage: string | null;
}

export const EmailErrorAlert: React.FC<EmailErrorAlertProps> = ({ errorMessage }) => {
  if (!errorMessage) return null;
  
  // Check for specific error messages to provide more helpful guidance
  let title = "Error";
  let icon = <XCircle className="h-4 w-4" />;
  let variant = "destructive";
  
  if (errorMessage.includes("Gmail not connected") || errorMessage.includes("connect your Gmail")) {
    title = "Gmail Connection Required";
    icon = <InfoIcon className="h-4 w-4" />;
    variant = "default";
  } else if (errorMessage.includes("token expired")) {
    title = "Session Expired";
    icon = <AlertCircle className="h-4 w-4" />;
    variant = "default";
  }

  return (
    <Alert variant={variant as "default" | "destructive"}>
      {icon}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );
};
