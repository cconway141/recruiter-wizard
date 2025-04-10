
import React, { useEffect } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { GmailConnectButton } from "@/components/candidates/email/GmailConnectButton";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const GmailCard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Check for Gmail connection in progress when component mounts
  useEffect(() => {
    const connectionInProgress = sessionStorage.getItem('gmailConnectionInProgress');
    if (connectionInProgress === 'true') {
      // Clear the flag
      sessionStorage.removeItem('gmailConnectionInProgress');
      
      // Force refresh connection status
      if (user?.id) {
        console.log("Connection was in progress, forcing refresh...");
        queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
        queryClient.invalidateQueries({ queryKey: ['gmail-connection'] });
        
        toast({
          title: "Checking connection status",
          description: "Verifying Gmail API connection status...",
        });
      }
    }
  }, [user, queryClient, toast]);
  
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
    }
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
        <GmailConnectButton />
        <Button 
          variant="ghost" 
          onClick={forceRefreshGmailStatus}
          className="text-xs"
        >
          Refresh Connection Status
        </Button>
      </CardContent>
    </Card>
  );
};
