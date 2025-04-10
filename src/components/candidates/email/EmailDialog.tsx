
import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEmailDialog } from "./dialog/useEmailDialog";
import { EmailDialogHeader } from "./dialog/EmailDialogHeader";
import { EmailConnectionAlert } from "./dialog/EmailConnectionAlert";
import { EmailDialogContent } from "./dialog/EmailDialogContent";
import { EmailDialogActions } from "./dialog/EmailDialogActions";
import { useJobs } from "@/contexts/JobContext";

interface EmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  candidateEmail?: string;
  jobId?: string;
  jobTitle?: string; // This still uses the old name
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
  // Get the job from context instead of relying on passed props
  const { getJob } = useJobs();
  const job = jobId ? getJob(jobId) : undefined;
  
  // Always use the job title from the job object for consistency
  // Ensure we have a value even if the job can't be found
  const actualJobTitle = job?.candidateFacingTitle || jobTitle || "General Position";

  // Debug initialization with better clarity
  useEffect(() => {
    console.group('EmailDialog Initialization');
    console.log('Props received in EmailDialog:', {
      candidateName,
      candidateEmail,
      jobId,
      jobTitle, 
      jobFromContext: job ? 'Found job in context' : 'No job found in context',
      actualCandidateFacingTitle: actualJobTitle,
      candidateId,
      threadId,
      threadTitle
    });
    console.groupEnd();
  }, [candidateName, candidateEmail, jobId, jobTitle, job, actualJobTitle, candidateId, threadId, threadTitle]);

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
    candidateFacingTitle: actualJobTitle, // Always pass a valid job title
    candidateId,
    threadId,
    threadTitle,
    onClose,
  });

  console.debug("EmailDialog rendered:", {
    isOpen,
    candidateName,
    candidateEmail,
    actualJobTitle,
    isGmailConnected,
    hasConnectGmail: !!connectGmail,
    connectGmailType: typeof connectGmail
  });
  
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
          onConnect={handleConnectGmail}
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
