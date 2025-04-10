
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmailTemplateSelector } from "./EmailTemplateSelector";
import { EmailContent } from "./EmailContent";
import { EmailErrorAlert } from "./EmailErrorAlert";
import { useMessageTemplates } from "@/hooks/useMessageTemplates";
import { useEmailActions } from "./useEmailActions";
import { useGmailAuth } from "@/hooks/useGmailAuth";
import { useNavigate } from "react-router-dom";
import { GmailConnectButton } from "./GmailConnectButton";

interface EmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  candidateEmail?: string | null;
  jobId?: string;
  jobTitle?: string;
  candidateId?: string;
  threadId?: string | null;
  threadTitle?: string;
}

export function EmailDialog({
  isOpen,
  onClose,
  candidateName,
  candidateEmail,
  jobId,
  jobTitle,
  candidateId,
  threadId,
  threadTitle,
}: EmailDialogProps) {
  const { templates, loading: templatesLoading } = useMessageTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const navigate = useNavigate();
  
  // Use the component-specific useEmailActions hook for improved functionality
  const {
    isSending,
    errorMessage,
    isCheckingGmail,
    isGmailConnected,
    sendEmailViaGmail,
    composeEmail,
    checkGmailConnection,
    threadId: currentThreadId
  } = useEmailActions({
    candidate: {
      id: candidateId || 'temp-id',
      name: candidateName,
      email: candidateEmail,
      threadIds: threadId ? { [jobId || 'default']: threadId } : {}
    },
    jobId,
    jobTitle,
    templates: templates || [],
    selectedTemplate,
    onSuccess: onClose
  });

  // Reset selected template when dialog reopens
  useEffect(() => {
    if (isOpen) {
      setSelectedTemplate(threadId ? "custom" : "custom");
    }
  }, [isOpen, threadId]);

  // Check Gmail connection when dialog opens
  useEffect(() => {
    if (isOpen) {
      checkGmailConnection();
    }
  }, [isOpen, checkGmailConnection]);

  const handleSendEmail = async () => {
    if (!candidateEmail || !candidateName) return;
    await sendEmailViaGmail();
  };
  
  const navigateToProfile = () => {
    onClose();
    navigate('/profile');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Email to {candidateName}</DialogTitle>
          <DialogDescription>
            Send a recruitment email to this candidate.
          </DialogDescription>
        </DialogHeader>

        {/* Gmail connection check at the top */}
        {!isGmailConnected && !isCheckingGmail && (
          <div className="mb-4">
            <EmailErrorAlert 
              errorMessage="You need to connect your Gmail account to send emails."
              onGoToProfile={navigateToProfile}
            />
            <div className="mt-4 flex justify-between items-center">
              <GmailConnectButton />
              <Button variant="outline" size="sm" onClick={navigateToProfile}>
                Go to Profile
              </Button>
            </div>
            <Separator className="my-4" />
          </div>
        )}

        {errorMessage && (
          <EmailErrorAlert 
            errorMessage={errorMessage}
            onGoToProfile={navigateToProfile}
          />
        )}

        {!threadId && (
          <div className="py-3">
            <EmailTemplateSelector
              templates={templates || []}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
            />
          </div>
        )}

        {threadId && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Replying to previous email thread: {threadTitle || "No subject"}
            </p>
          </div>
        )}

        <EmailContent
          selectedTemplate={selectedTemplate}
          templates={templates || []}
          candidateName={candidateName}
          job={jobTitle ? { candidateFacingTitle: jobTitle } : undefined}
          candidateEmail={candidateEmail}
          threadTitle={threadTitle}
          threadId={threadId}
        />

        <DialogFooter>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendEmail}
              disabled={isSending || !isGmailConnected}
            >
              {isSending ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
