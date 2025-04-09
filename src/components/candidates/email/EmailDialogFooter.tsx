
import React from "react";
import { ExternalLink, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

interface EmailDialogFooterProps {
  candidateEmail?: string | null;
  isSending: boolean;
  onSendEmail: () => Promise<void>;
  onComposeEmail: () => void;
}

export const EmailDialogFooter: React.FC<EmailDialogFooterProps> = ({
  candidateEmail,
  isSending,
  onSendEmail,
  onComposeEmail
}) => {
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
          
          <Button 
            onClick={onSendEmail}
            className="flex items-center gap-2"
            disabled={isSending}
          >
            {isSending ? (
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
