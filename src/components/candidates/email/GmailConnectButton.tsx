
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConfigErrorButton } from "./ConfigErrorButton";
import { GmailButtonContent } from "./GmailButtonContent";
import { useGmailConnection } from "@/hooks/useGmailConnection";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Info } from "lucide-react";
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
  const [connectionAttemptsCount, setConnectionAttemptsCount] = useState(0);
  const {
    isConnected,
    isLoading,
    configError,
    connectGmail,
    disconnectGmail,
    forceRefresh
  } = useGmailConnection({ onConnectionChange });
  
  // Check for stored connection attempts
  useEffect(() => {
    const attemptCount = sessionStorage.getItem('gmailConnectionAttempts');
    if (attemptCount) {
      setConnectionAttemptsCount(parseInt(attemptCount, 10));
    }
    
    // Force a refresh on mount to ensure we have the latest connection status
    forceRefresh();
  }, [forceRefresh]);
  
  const handleConnectGmail = async () => {
    try {
      // Clear any previous connection attempt flags
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      sessionStorage.removeItem('gmailConnectionError');
      
      // Track connection attempts
      const newCount = connectionAttemptsCount + 1;
      setConnectionAttemptsCount(newCount);
      sessionStorage.setItem('gmailConnectionAttempts', newCount.toString());
      
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
  
  const handleDisconnectGmail = async () => {
    try {
      toast({
        title: "Disconnecting Gmail",
        description: "Removing Gmail API connection...",
      });
      
      await disconnectGmail();
      
    } catch (error) {
      console.error("Error disconnecting Gmail:", error);
      toast({
        title: "Disconnection Error",
        description: "Failed to disconnect Gmail. See console for details.",
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
  
  // For config error case, return the ConfigErrorButton with connection status and handlers
  if (configError) {
    return (
      <ConfigErrorButton 
        className={className} 
        isConnected={isConnected}
        onClick={handleConnectGmail}
        onDisconnect={handleDisconnectGmail}
      />
    );
  }
  
  // Debug info variables
  const redirectUri = sessionStorage.getItem('gmailRedirectUri');
  const storageItems = [];
  
  // Collect all Gmail-related session storage items for debugging
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.toLowerCase().includes('gmail')) {
      storageItems.push({
        key,
        value: sessionStorage.getItem(key)
      });
    }
  }
  
  return (
    <div className="space-y-2">
      {isConnected ? (
        <ConfigErrorButton 
          className={className} 
          isConnected={true}
          onDisconnect={handleDisconnectGmail}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          className={`flex items-center gap-2 ${className}`}
          onClick={handleConnectGmail}
          disabled={isLoading}
        >
          <GmailButtonContent
            isConnected={isConnected}
            isLoading={isLoading}
            variant="connect"
          />
        </Button>
      )}
      
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
          <Info className="h-4 w-4" />
          <AlertTitle>Gmail Connection Debug Information</AlertTitle>
          <AlertDescription className="text-xs break-all space-y-2">
            <div>
              <p className="font-semibold">Current redirect URI:</p>
              <code className="bg-muted p-1 rounded">{redirectUri}</code>
            </div>
            
            <div>
              <p className="font-semibold">Connection attempts: {connectionAttemptsCount}</p>
              <p className="font-semibold mt-2">Current URL:</p>
              <code className="bg-muted p-1 rounded">{window.location.href}</code>
            </div>
            
            {storageItems.length > 0 && (
              <div>
                <p className="font-semibold mt-2">Session Storage:</p>
                <div className="max-h-40 overflow-y-auto bg-muted rounded p-2">
                  {storageItems.map((item, idx) => (
                    <div key={idx} className="mb-1">
                      <strong>{item.key}:</strong> {item.value}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="mt-2">
              For Gmail API connection to work, the exact URI above must be added to your Google Cloud Console OAuth 2.0 Client ID's authorized redirect URIs.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
