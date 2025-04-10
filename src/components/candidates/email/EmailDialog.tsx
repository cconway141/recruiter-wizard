
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEmailDialog } from "./dialog/useEmailDialog";
import { EmailDialogHeader } from "./dialog/EmailDialogHeader";
import { EmailConnectionAlert } from "./dialog/EmailConnectionAlert";
import { EmailDialogContent } from "./dialog/EmailDialogContent";
import { EmailDialogActions } from "./dialog/EmailDialogActions";

interface EmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  candidateEmail?: string;
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
  const {
    subject,
    body,
    selectedTemplate,
    emailTemplates,
    isSending,
    errorMessage,
    isGmailConnected,
    setSubject,
    setBody,
    handleTemplateChange,
    handleSendEmail,
    handleComposeInGmail,
    handleOpenThreadInGmail,
    connectGmail,
  } = useEmailDialog({
    candidateName,
    candidateEmail,
    jobId,
    jobTitle,
    candidateId,
    threadId,
    threadTitle,
    onClose,
  });

  // Add improved logging to debug
  console.debug("EmailDialog rendered:", {
    isOpen,
    candidateName,
    candidateEmail,
    isGmailConnected,
    hasConnectGmail: !!connectGmail,
    connectGmailType: typeof connectGmail
  });
  
  // Add a wrapper function for connect with debugging
  const handleConnectGmail = async () => {
    console.debug("handleConnectGmail called in EmailDialog");
    if (!connectGmail) {
      console.error("connectGmail is undefined in EmailDialog");
      return;
    }
    
    try {
      console.debug("Calling connectGmail from EmailDialog");
      await connectGmail();
    } catch (error) {
      console.error("Error calling connectGmail in EmailDialog:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
        <EmailDialogHeader 
          candidateName={candidateName} 
          candidateEmail={candidateEmail} 
        />

        <EmailConnectionAlert 
          isGmailConnected={isGmailConnected}
          errorMessage={errorMessage}
          onConnect={handleConnectGmail} // Using our wrapper function
        />

        <EmailDialogContent 
          threadId={threadId}
          subject={subject}
          body={body}
          selectedTemplate={selectedTemplate}
          emailTemplates={emailTemplates || []}
          onTemplateChange={handleTemplateChange}
          onSubjectChange={setSubject}
          onBodyChange={setBody}
        />

        <EmailDialogActions 
          isSending={isSending}
          isGmailConnected={isGmailConnected}
          candidateEmail={candidateEmail}
          onSend={handleSendEmail}
          onCancel={onClose}
          onComposeInGmail={handleComposeInGmail}
          onOpenInGmail={handleOpenThreadInGmail}
        />
      </DialogContent>
    </Dialog>
  );
}
