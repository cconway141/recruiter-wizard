
import React from "react";
import { MailCheck } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { GmailConnectButton } from "@/components/candidates/email/GmailConnectButton";
import { GmailDisconnectButton } from "./gmail/GmailDisconnectButton";
import { useGmailConnection } from "@/hooks/gmail";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

export const GmailCard: React.FC = () => {
  const { user } = useAuth();
  // Using our enhanced hook for Gmail connection management
  const { 
    isConnected: isGmailConnected, 
    isLoading: isCheckingConnection,
    disconnectGmail,
    silentCheckConnection
  } = useGmailConnection({ 
    showLoadingUI: true
  });
  
  // Run a silent background connection check on mount
  React.useEffect(() => {
    if (user?.id) {
      // Clear any stale connection flags
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      
      // Run background check
      silentCheckConnection().catch(() => {
        console.log("Background Gmail check failed - continuing silently");
      });
    }
  }, [user?.id, silentCheckConnection]);
  
  // Create a void version of the disconnect function to fix the TypeScript error
  const handleDisconnect = async () => {
    await disconnectGmail();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MailCheck className="h-5 w-5" /> Gmail API Access
        </CardTitle>
        <CardDescription>Connect Gmail to send emails from the platform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Allow this application to send emails on your behalf through your Gmail account.
        </p>
        
        {/* Connection status indicator */}
        {isGmailConnected && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-4">
            <p className="text-green-700 font-medium flex items-center">
              <MailCheck className="h-4 w-4 mr-2 text-green-600" />
              Gmail Connected
            </p>
          </div>
        )}
        
        {/* Loading indicator for any Gmail operations */}
        <LoadingIndicator 
          id="gmail-connection-check" 
          className="mb-2"
          size="sm"
          text="Checking connection status..."
        />
        
        {/* Show either connect or disconnect button based on connection status */}
        {isGmailConnected ? (
          <GmailDisconnectButton 
            onDisconnect={handleDisconnect}
            isLoading={isCheckingConnection}
          />
        ) : (
          <div className="mb-2">
            <GmailConnectButton />
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>
          Note: Gmail connection is separate from Google account login. 
          This enables the application to send emails through your Gmail account.
        </p>
      </CardFooter>
    </Card>
  );
};
