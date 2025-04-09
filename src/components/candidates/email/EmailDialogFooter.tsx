
import React, { useState, useEffect } from "react";
import { ExternalLink, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { GmailConnectButton } from "./GmailConnectButton";
import { useAuth } from "@/contexts/AuthContext";

interface EmailDialogFooterProps {
  candidateEmail?: string | null;
  isSending: boolean;
  onSendEmail: () => Promise<void>;
  onComposeEmail: () => void;
  isGmailConnected?: boolean | null;
  checkGmailConnection?: () => Promise<boolean>;
}

export const EmailDialogFooter: React.FC<EmailDialogFooterProps> = ({
  candidateEmail,
  isSending,
  onSendEmail,
  onComposeEmail,
  isGmailConnected,
  checkGmailConnection
}) => {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<boolean | null>(isGmailConnected);
  
  // Check Gmail connection on mount if needed
  useEffect(() => {
    // Only update if the prop changes
    if (isGmailConnected !== undefined && isGmailConnected !== null) {
      setGmailStatus(isGmailConnected);
    } else if (checkGmailConnection && user) {
      const checkConnection = async () => {
        setIsChecking(true);
        const isConnected = await checkGmailConnection();
        setGmailStatus(isConnected);
        setIsChecking(false);
      };
      
      checkConnection();
    }
  }, [isGmailConnected, checkGmailConnection, user]);
  
  // Handle connection status change
  const handleConnectionChange = (connected: boolean) => {
    setGmailStatus(connected);
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      
      {candidateEmail && (
        <>
          <Button 
            onClick={onComposeEmail}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Mail className="h-4 w-4" />
            <span>Compose in Gmail</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
          
          <GmailConnectButton 
            onConnectionChange={handleConnectionChange}
            className="mb-2 sm:mb-0"
          />
          
          <Button 
            onClick={onSendEmail}
            className="flex items-center gap-2"
            disabled={isSending || isChecking || !gmailStatus}
          >
            {isSending || isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            <span>Send Email Now</span>
          </Button>
        </>
      )}
    </div>
  );
};
