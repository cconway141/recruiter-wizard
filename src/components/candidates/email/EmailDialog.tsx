
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
  // Get the job from context instead of relying on passed props
  const { getJob } = useJobs();
  const job = jobId ? getJob(jobId) : undefined;
  
  // Always use the candidateFacingTitle from the job object for consistency
  // Ensure we have a value even if the job can't be found
  const candidateFacingTitle = job?.candidateFacingTitle || jobTitle || "";

  // Debug initialization
  useEffect(() => {
    console.log('EmailDialog initialized with:', {
      candidateName,
      candidateEmail,
      jobId,
      originalJobTitle: jobTitle,
      jobFromContext: job ? job.candidateFacingTitle : 'Not found',
      finalCandidateFacingTitle: candidateFacingTitle,
      threadId,
      threadTitle
    });
  }, [candidateName, candidateEmail, jobId, jobTitle, job, candidateFacingTitle, threadId, threadTitle]);

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
    candidateFacingTitle, // Pass the correct job title
    candidateId,
    threadId,
    threadTitle,
    onClose,
  });

  const handleConnectGmail = async () => {
    if (!connectGmail) {
      console.error("connectGmail is undefined");
      return;
    }
    
    try {
      await connectGmail();
    } catch (error) {
      console.error("Error connecting to Gmail:", error);
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
