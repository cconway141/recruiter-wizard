
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfigErrorButton } from "./ConfigErrorButton";
import { GmailButtonContent } from "./GmailButtonContent";
import { useGmailConnection } from "@/hooks/useGmailConnection";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface GmailConnectButtonProps {
  onConnectionChange?: (connected: boolean) => void;
  className?: string;
  variant?: "default" | "refresh";
}

export const GmailConnectButton: React.FC<GmailConnectButtonProps> = ({ 
  onConnectionChange,
  className = "",
  variant = "default"
}) => {
  const { toast } = useToast();
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const {
    isConnected,
    isLoading,
    configError,
    connectGmail,
    disconnectGmail,
    forceRefresh
  } = useGmailConnection({ onConnectionChange });
  
  if (configError) {
    return <ConfigErrorButton className={className} />;
  }
  
  const handleConnectGmail = async () => {
    try {
      // Clear any previous connection attempt flags
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      sessionStorage.removeItem('gmailConnectionError');
      
      toast({
        title: "Connecting Gmail",
        description: "You will be redirected to Google for authentication...",
      });
      
      // Start the connection process
      const result = await connectGmail();
      
      // Store the redirect URI in session storage for debugging purposes
      if (result?.redirectUri) {
        sessionStorage.setItem('gmailRedirectUri', result.redirectUri);
        console.log("Using redirect URI:", result.redirectUri);
      }
    } catch (error) {
      console.error("Error initiating Gmail connection:", error);
      toast({
        title: "Connection Error",
        description: "Failed to initiate Gmail connection. See console for details.",
        variant: "destructive",
      });
    }
  };
  
  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };
  
  // Handle refresh button variant
  if (variant === "refresh") {
    return (
      <Button
        type="button"
        variant="ghost"
        className={`flex items-center gap-2 text-xs ${className}`}
        onClick={forceRefresh}
        disabled={isLoading}
      >
        <GmailButtonContent
          isConnected={isConnected}
          isLoading={isLoading}
          variant="refresh"
        />
      </Button>
    );
  }
  
  const redirectUri = sessionStorage.getItem('gmailRedirectUri');
  
  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={isConnected ? "default" : "outline"}
        className={`flex items-center gap-2 ${className}`}
        onClick={isConnected ? disconnectGmail : handleConnectGmail}
        disabled={isLoading}
      >
        <GmailButtonContent
          isConnected={isConnected}
          isLoading={isLoading}
          variant={isConnected ? "connected" : "connect"}
        />
      </Button>
      
      {!isConnected && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-muted-foreground" 
          onClick={toggleDebugInfo}
        >
          {showDebugInfo ? "Hide Debug Info" : "Show Debug Info"}
        </Button>
      )}
      
      {showDebugInfo && redirectUri && (
        <Alert className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Redirect URI Information</AlertTitle>
          <AlertDescription className="text-xs break-all">
            <p>Current redirect URI: <code className="bg-muted p-1 rounded">{redirectUri}</code></p>
            <p className="mt-2">For Gmail API connection to work, this exact URI must be added to your Google Cloud Console OAuth 2.0 Client ID's authorized redirect URIs.</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
