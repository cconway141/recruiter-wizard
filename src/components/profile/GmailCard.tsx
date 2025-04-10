
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
import { useGmailCardState } from "./gmail/useGmailCardState";

export const GmailCard: React.FC = () => {
  const {
    isGmailConnected,
    handleDisconnectGmail,
  } = useGmailCardState();

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
        
        {/* Connection status indicator without any error states */}
        {isGmailConnected && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-4">
            <p className="text-green-700 font-medium flex items-center">
              <MailCheck className="h-4 w-4 mr-2 text-green-600" />
              Gmail Connected
            </p>
          </div>
        )}
        
        {/* Show either connect or disconnect button based solely on connection status */}
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
