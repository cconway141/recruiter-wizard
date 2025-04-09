
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useMessageTemplates } from "@/hooks/useMessageTemplates";
import { useJobs } from "@/contexts/JobContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter
} from "@/components/ui/dialog";
import { EmailTemplateSelector } from "./EmailTemplateSelector";
import { EmailContent } from "./EmailContent";
import { EmailDialogFooter } from "./EmailDialogFooter";
import { EmailErrorAlert } from "./EmailErrorAlert";
import { useEmailActions } from "./useEmailActions";

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: {
    id: string;
    name: string;
    email?: string | null;
    threadIds?: Record<string, string>; // Store thread IDs for each job
  };
}

export const EmailDialog: React.FC<EmailDialogProps> = ({ 
  open, 
  onOpenChange, 
  candidate 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");
  const { templates } = useMessageTemplates();
  const { id: jobId } = useParams<{ id: string }>();
  const { getJob } = useJobs();
  const job = jobId ? getJob(jobId) : undefined;

  const { 
    isSending,
    errorMessage,
    isGmailConnected,
    checkGmailConnection,
    sendEmailViaGmail,
    composeEmail
  } = useEmailActions({
    candidate,
    jobId,
    jobTitle: job?.candidateFacingTitle,
    templates,
    selectedTemplate,
    onSuccess: () => onOpenChange(false)
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email {candidate.name}</DialogTitle>
          <DialogDescription>
            Select a template or compose a custom email to this candidate.
            {candidate.threadIds?.[jobId || ''] 
              ? ' This will continue the existing email thread.' 
              : ' This will start a new email thread.'}
          </DialogDescription>
        </DialogHeader>
        
        <EmailContent 
          selectedTemplate={selectedTemplate}
          templates={templates}
          candidateName={candidate.name}
          candidateEmail={candidate.email}
          job={job}
        />
        
        {candidate.email && (
          <EmailTemplateSelector
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
            templates={templates}
          />
        )}
        
        <EmailErrorAlert errorMessage={errorMessage} />
        
        <DialogFooter>
          <EmailDialogFooter
            candidateEmail={candidate.email}
            isSending={isSending}
            onSendEmail={sendEmailViaGmail}
            onComposeEmail={composeEmail}
            isGmailConnected={isGmailConnected}
            checkGmailConnection={checkGmailConnection}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
