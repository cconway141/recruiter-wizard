import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMessageTemplates } from "@/hooks/useMessageTemplates";
import { useJobs } from "@/contexts/JobContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { EmailTemplateSelector } from "./EmailTemplateSelector";
import { EmailContent } from "./EmailContent";
import { EmailDialogFooter } from "./EmailDialogFooter";
import { EmailErrorAlert } from "./EmailErrorAlert";
import { useEmailActions } from "./useEmailActions";
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail } from "lucide-react";
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
  const {
    templates,
    loading: templatesLoading
  } = useMessageTemplates();
  const {
    id: jobId
  } = useParams<{
    id: string;
  }>();
  const {
    getJob
  } = useJobs();
  const job = jobId ? getJob(jobId) : undefined;

  // Make sure we have templates before proceeding
  useEffect(() => {
    if (templates && templates.length > 0) {
      console.log("Available templates:", templates.length);
    }
  }, [templates]);
  const threadTitle = job ? `ITBC ${job.candidateFacingTitle} - ${candidate.name}` : `ITBC - ${candidate.name}`;
  const hasExistingThread = jobId && candidate.threadIds && candidate.threadIds[jobId];
  const {
    isSending,
    errorMessage,
    isGmailConnected,
    checkGmailConnection,
    sendEmailViaGmail,
    composeEmail,
    getEmailContent,
    threadId
  } = useEmailActions({
    candidate,
    jobId,
    jobTitle: job?.candidateFacingTitle,
    templates,
    selectedTemplate,
    onSuccess: () => onOpenChange(false)
  });
  const [previewContent, setPreviewContent] = useState({
    subject: '',
    body: ''
  });

  // Update preview when template changes
  useEffect(() => {
    if (getEmailContent) {
      const content = getEmailContent();
      setPreviewContent(content);
      console.log("Preview content updated - Body length:", content.body?.length || 0);
    }
  }, [selectedTemplate, getEmailContent]);
  const openGmailThread = () => {
    if (jobId && candidate.threadIds && candidate.threadIds[jobId]) {
      window.open(`https://mail.google.com/mail/u/0/#search/rfc822msgid:${candidate.threadIds[jobId]}`, '_blank');
    } else {
      const searchQuery = encodeURIComponent(`"${threadTitle}"`);
      window.open(`https://mail.google.com/mail/u/0/#search/${searchQuery}`, '_blank');
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email {candidate.name}</DialogTitle>
          <DialogDescription>
            Select a template or compose a custom email to this candidate.
            {hasExistingThread ? ' This will continue the existing email thread.' : ' This will start a new email thread.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
          <div className="text-sm font-medium text-gray-700">
            <span className="block">Thread: {threadTitle}</span>
            {hasExistingThread && <span className="text-xs text-gray-500">Continuing existing thread for this job</span>}
          </div>
          {(hasExistingThread || jobId) && <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={openGmailThread}>
              <Mail className="h-4 w-4" />
              <span>Go to thread in Gmail</span>
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>}
        </div>
        
        {templatesLoading ? <div className="py-4 text-center">Loading templates...</div> : <>
            <EmailContent selectedTemplate={selectedTemplate} templates={templates} candidateName={candidate.name} candidateEmail={candidate.email} job={job} threadTitle={threadTitle} threadId={threadId} />
            
            {candidate.email && <EmailTemplateSelector selectedTemplate={selectedTemplate} onSelectTemplate={setSelectedTemplate} templates={templates} />}
          </>}
        
        {/* Preview actual email being sent */}
        {previewContent.body}
        
        <EmailErrorAlert errorMessage={errorMessage} />
        
        <DialogFooter>
          <EmailDialogFooter candidateEmail={candidate.email} isSending={isSending} onSendEmail={sendEmailViaGmail} onComposeEmail={composeEmail} isGmailConnected={isGmailConnected} checkGmailConnection={checkGmailConnection} />
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};