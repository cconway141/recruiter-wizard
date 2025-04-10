
import React, { useEffect, useState } from "react";
import { MailCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { GmailConnectButton } from "@/components/candidates/email/GmailConnectButton";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useGmailAuth } from "@/hooks/useGmailAuth";

export const GmailCard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [connectionAttemptTime, setConnectionAttemptTime] = useState<number | null>(null);
  const { isGmailConnected, isCheckingGmail, checkGmailConnection } = useGmailAuth();
  
  // Check for Gmail connection in progress when component mounts
  useEffect(() => {
    const connectionInProgress = sessionStorage.getItem('gmailConnectionInProgress');
    const attemptTimeStr = sessionStorage.getItem('gmailConnectionAttemptTime');
    
    if (connectionInProgress === 'true' && attemptTimeStr) {
      const attemptTime = parseInt(attemptTimeStr, 10);
      setConnectionAttemptTime(attemptTime);
      
      // Only clear flags if they're older than 5 minutes
      if (Date.now() - attemptTime > 5 * 60 * 1000) {
        sessionStorage.removeItem('gmailConnectionInProgress');
        sessionStorage.removeItem('gmailConnectionAttemptTime');
        setConnectionAttemptTime(null);
      } else {
        // Force refresh connection status
        if (user?.id) {
          console.log("Connection was in progress, forcing refresh...");
          queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
          
          toast({
            title: "Checking connection status",
            description: "Verifying Gmail API connection status...",
          });
        }
      }
    }
    
    // Force a check on mount and after route change
    if (user?.id) {
      console.log("Forcing Gmail connection check on GmailCard mount");
      checkGmailConnection();
      // Force invalidation of all Gmail connection queries
      queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
      queryClient.invalidateQueries({ queryKey: ['gmail-connection'] });
    }
  }, [user, queryClient, toast, checkGmailConnection]);
  
  const forceRefreshGmailStatus = () => {
    if (user?.id) {
      // Force immediate invalidation of all Gmail connection queries
      console.log("Manually refreshing Gmail connection status");
      toast({
        title: "Refreshing",
        description: "Checking Gmail connection status...",
      });
      
      queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
      queryClient.invalidateQueries({ queryKey: ['gmail-connection'] });
      
      // Clear any pending connection flags
      sessionStorage.removeItem('gmailConnectionInProgress');
      sessionStorage.removeItem('gmailConnectionAttemptTime');
      setConnectionAttemptTime(null);
      
      // Explicitly check connection
      checkGmailConnection();
    }
  };
  
  // Show alert if connection has been pending for more than 30 seconds
  const showPendingAlert = connectionAttemptTime && (Date.now() - connectionAttemptTime > 30 * 1000);

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
        
        {showPendingAlert && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Pending</AlertTitle>
            <AlertDescription>
              A Gmail connection attempt is pending but hasn't completed. 
              If you started the connection process but haven't finished it, 
              please try again or refresh the status.
            </AlertDescription>
          </Alert>
        )}
        
        <GmailConnectButton />
        
        <Button 
          variant="ghost" 
          onClick={forceRefreshGmailStatus}
          className="text-xs"
          disabled={isCheckingGmail}
        >
          {isCheckingGmail ? "Checking..." : "Refresh Connection Status"}
        </Button>
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
