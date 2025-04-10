
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

export const GmailCard: React.FC = () => {
  const { user } = useAuth();
  // Using the hook with only state management, no automatic checks
  const { isGmailConnected, handleDisconnectGmail } = useGmailCardState();
  
  // Get checkGmailConnection function for the one-time background check
  const { checkGmailConnection } = useGmailConnection({ 
    skipLoading: true // Critical: This prevents loading states from affecting UI
  });
  
  // Run a single background connection check on mount
  // This will not affect the UI rendering since we use skipLoading
  useEffect(() => {
    if (user?.id) {
      // Use setTimeout to ensure this happens after initial render
      // and doesn't block the UI in any way
      const timer = setTimeout(() => {
        // Run a silent background check that won't affect UI
        checkGmailConnection().catch(() => {
          // Silently handle errors - we'll just show "Connect" button by default
          console.log("Background Gmail check failed - continuing silently");
        });
        
        // Clear any stale connection flags
        sessionStorage.removeItem('gmailConnectionInProgress');
        sessionStorage.removeItem('gmailConnectionAttemptTime');
      }, 100); // Small delay ensures UI renders first
      
      return () => clearTimeout(timer);
    }
  }, [user?.id, checkGmailConnection]);
  
  // Always render immediately - don't show loading states
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
        
        {/* Connection status indicator - only shows when connected */}
        {isGmailConnected && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-4">
            <p className="text-green-700 font-medium flex items-center">
              <MailCheck className="h-4 w-4 mr-2 text-green-600" />
              Gmail Connected
            </p>
          </div>
        )}
        
        {/* Show either connect or disconnect button based on connection status */}
        {isGmailConnected ? (
          <GmailDisconnectButton 
            onDisconnect={handleDisconnectGmail}
            isLoading={false} // Never show loading state
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
