
import React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { ExternalLink, Search, Loader2 } from "lucide-react";

interface EmailDialogActionsProps {
  isSending: boolean;
  isGmailConnected: boolean;
  candidateEmail?: string;
  onSend: () => Promise<void>;
  onCancel: () => void;
  onComposeInGmail: () => void;
  onOpenInGmail: () => void;
}

export const EmailDialogActions: React.FC<EmailDialogActionsProps> = ({
  isSending,
  isGmailConnected,
  candidateEmail,
  onSend,
  onCancel,
  onComposeInGmail,
  onOpenInGmail,
}) => {
  return (
    <DialogFooter className="gap-2 flex-wrap sm:justify-between">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenInGmail}
          disabled={!isGmailConnected}
          type="button"
        >
          <Search className="h-4 w-4 mr-2" />
          View in Gmail
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onComposeInGmail}
          disabled={!isGmailConnected || !candidateEmail}
          type="button"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in Gmail
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onSend}
          disabled={!isGmailConnected || !candidateEmail || isSending}
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Email"
          )}
        </Button>
      </div>
    </DialogFooter>
  );
};
