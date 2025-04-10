
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
import { GmailConnectionStatus } from "./gmail/GmailConnectionStatus";
import { GmailDisconnectButton } from "./gmail/GmailDisconnectButton";
import { GmailRefreshButton } from "./gmail/GmailRefreshButton";
import { useGmailCardState } from "./gmail/useGmailCardState";

export const GmailCard: React.FC = () => {
  const {
    isGmailConnected,
    isCheckingGmail,
    errorMessage,
    errorOccurred,
    showPendingAlert,
    handleDisconnectGmail,
    forceRefreshGmailStatus
  } = useGmailCardState();

  console.log("Current Gmail connection status in GmailCard:", isGmailConnected);

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
        
        {/* Display connection status */}
        <GmailConnectionStatus 
          isConnected={isGmailConnected}
          isCheckingGmail={isCheckingGmail}
          errorMessage={errorMessage}
          errorOccurred={errorOccurred}
          showPendingAlert={showPendingAlert}
        />
        
        {/* Conditionally render connect or disconnect button based on connection status */}
        {isGmailConnected ? (
          // Disconnect button when connected
          <GmailDisconnectButton 
            onDisconnect={handleDisconnectGmail}
            isLoading={isCheckingGmail}
          />
        ) : (
          // Connect button when not connected
          <div className="mb-2">
            <GmailConnectButton />
          </div>
        )}
        
        {/* Always show refresh button */}
        <GmailRefreshButton 
          onRefresh={forceRefreshGmailStatus}
          isLoading={isCheckingGmail}
        />
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
