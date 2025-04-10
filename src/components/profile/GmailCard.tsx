
import React, { useEffect } from "react";
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
import { useGmailCardState } from "./gmail/useGmailCardState";
import { useGmailConnection } from "@/hooks/gmail";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

export const GmailCard: React.FC = () => {
  const { user } = useAuth();
  // Using the hook with our new pattern that replaced skipLoading
  const { isGmailConnected, handleDisconnectGmail } = useGmailCardState();
  
  // Get checkGmailConnection function for the background check
  const { silentCheckConnection } = useGmailConnection({ 
    showLoadingUI: false // Explicit setting replacing skipLoading
  });
  
  // Run a single background connection check on mount
  useEffect(() => {
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
            onDisconnect={handleDisconnectGmail}
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
