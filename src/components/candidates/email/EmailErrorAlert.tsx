
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmailErrorAlertProps {
  errorMessage: string | null;
}

export const EmailErrorAlert: React.FC<EmailErrorAlertProps> = ({ errorMessage }) => {
  if (!errorMessage) return null;
  
  return (
    <Alert variant="destructive" className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {errorMessage}
      </AlertDescription>
    </Alert>
  );
};
