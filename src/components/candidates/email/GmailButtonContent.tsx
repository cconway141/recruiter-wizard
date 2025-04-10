
import React from "react";
import { Loader2, Mail, RefreshCw, CheckCircle } from "lucide-react";

interface GmailButtonContentProps {
  isConnected: boolean;
  isLoading: boolean;
  variant: "connect" | "connected" | "refresh";
}

export const GmailButtonContent: React.FC<GmailButtonContentProps> = ({
  isConnected,
  isLoading,
  variant
}) => {
  if (isLoading) {
    return (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Checking...</span>
      </>
    );
  }
  
  if (variant === "refresh") {
    return (
      <>
        <RefreshCw className="h-4 w-4" />
        <span>Refresh Status</span>
      </>
    );
  }
  
  if (isConnected) {
    return (
      <>
        <CheckCircle className="h-4 w-4" />
        <span>Gmail API Connected</span>
      </>
    );
  }
  
  return (
    <>
      <Mail className="h-4 w-4" />
      <span>Connect Gmail API</span>
    </>
  );
};
