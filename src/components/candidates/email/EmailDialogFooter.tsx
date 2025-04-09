
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
  goToProfilePage?: () => void;
}

export const EmailDialogFooter: React.FC<EmailDialogFooterProps> = ({
  candidateEmail,
  isSending,
  onSendEmail,
  onComposeEmail,
  isGmailConnected,
  checkGmailConnection,
  goToProfilePage
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
      // We don't auto-check here anymore - the parent component controls this
      // to prevent infinite loops
      setGmailStatus(isGmailConnected);
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
            disabled={!gmailStatus}
          >
            <Mail className="h-4 w-4" />
            <span>Compose in Gmail</span>
            <ExternalLink className="h-3 w-3" />
          </Button>
          
          {!gmailStatus && goToProfilePage && (
            <Button 
              onClick={goToProfilePage}
              className="flex items-center gap-2"
              variant="default"
            >
              <span>Go to Profile to Connect Gmail</span>
            </Button>
          )}
          
          {!gmailStatus && (
            <GmailConnectButton 
              onConnectionChange={handleConnectionChange}
              className="mb-2 sm:mb-0"
            />
          )}
          
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
            <span>{gmailStatus ? "Send Email Now" : "Connect Gmail to Send"}</span>
          </Button>
        </>
      )}
    </div>
  );
};
