
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
import { useGmailConnection } from "@/hooks/gmail";
import { Skeleton } from "@/components/ui/skeleton";

export const GmailCard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [connectionAttemptTime, setConnectionAttemptTime] = useState<number | null>(null);
  const [errorOccurred, setErrorOccurred] = useState(false);
  
  const { 
    isConnected: isGmailConnected, 
    isLoading: isCheckingGmail, 
    configError: errorMessage, 
    checkGmailConnection 
  } = useGmailConnection();
  
  useEffect(() => {
    try {
      const connectionInProgress = sessionStorage.getItem('gmailConnectionInProgress');
      const attemptTimeStr = sessionStorage.getItem('gmailConnectionAttemptTime');
      
      if (connectionInProgress === 'true' && attemptTimeStr) {
        const attemptTime = parseInt(attemptTimeStr, 10);
        setConnectionAttemptTime(attemptTime);
        
        if (Date.now() - attemptTime > 5 * 60 * 1000) {
          sessionStorage.removeItem('gmailConnectionInProgress');
          sessionStorage.removeItem('gmailConnectionAttemptTime');
          setConnectionAttemptTime(null);
        } else {
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
    } catch (error) {
      console.error("Error in GmailCard useEffect:", error);
      setErrorOccurred(true);
    }
  }, [user, queryClient, toast]);
  
  // Separate the Gmail connection check to prevent crashes
  useEffect(() => {
    if (user?.id) {
      setTimeout(() => {
        try {
          console.log("Checking Gmail connection on GmailCard mount");
          checkGmailConnection().catch(err => {
            console.error("Error checking Gmail connection:", err);
            setErrorOccurred(true);
          });
        } catch (error) {
          console.error("Error in Gmail check effect:", error);
          setErrorOccurred(true);
        }
      }, 100);
    }
  }, [user?.id, checkGmailConnection]);
  
  const forceRefreshGmailStatus = () => {
    try {
      if (user?.id) {
        console.log("Manually refreshing Gmail connection status");
        toast({
          title: "Refreshing",
          description: "Checking Gmail connection status...",
        });
        
        queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
        
        sessionStorage.removeItem('gmailConnectionInProgress');
        sessionStorage.removeItem('gmailConnectionAttemptTime');
        setConnectionAttemptTime(null);
        
        checkGmailConnection().catch(err => {
          console.error("Error checking Gmail connection:", err);
          setErrorOccurred(true);
        });
      }
    } catch (error) {
      console.error("Error refreshing Gmail status:", error);
      toast({
        title: "Error",
        description: "Failed to refresh connection status",
        variant: "destructive"
      });
      setErrorOccurred(true);
    }
  };
  
  const showPendingAlert = connectionAttemptTime && (Date.now() - connectionAttemptTime > 30 * 1000);

  console.log("Current Gmail connection status in GmailCard:", isGmailConnected);

  if (isCheckingGmail && !errorOccurred) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailCheck className="h-5 w-5" /> Gmail API Access
          </CardTitle>
          <CardDescription>Checking connection status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

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
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {errorOccurred && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              There was a problem checking your Gmail connection status.
              Please try refreshing the status or reconnecting your account.
            </AlertDescription>
          </Alert>
        )}
        
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
