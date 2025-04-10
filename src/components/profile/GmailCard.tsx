
import React from "react";
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

export const GmailCard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const forceRefreshGmailStatus = () => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ['gmail-connection', user.id] });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MailCheck className="h-5 w-5" /> Gmail Integration
        </CardTitle>
        <CardDescription>Connect your Gmail account to send emails</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect your Gmail account to send emails directly from the platform.
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
