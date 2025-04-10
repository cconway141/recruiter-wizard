import { useState } from "react";
import { useEmailContent } from "@/hooks/useEmailContent";
import { useGmailConnection } from "@/hooks/gmail";
import { useEmailSender } from "@/hooks/email/useEmailSender";
import { useGmailComposer } from "@/hooks/email/useGmailComposer";
import { useCandidateThreads } from "@/hooks/email/useCandidateThreads";
import { useToast } from "@/hooks/use-toast";

interface UseEmailActionsProps {
  candidate: {
    id: string;
    name: string;
    email?: string | null;
    threadIds?: Record<string, string>;
  };
  jobId?: string;
  jobTitle?: string;
  templates: any[];
  selectedTemplate: string;
  onSuccess: () => void;
}

export const useEmailActions = ({
  candidate,
  jobId,
  jobTitle,
  templates,
  selectedTemplate,
  onSuccess
}: UseEmailActionsProps) => {
  const threadId = jobId && candidate.threadIds ? candidate.threadIds[jobId] || null : null;
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Extracted hook imports
  const { 
    isConnected: isGmailConnected, 
    isLoading: isCheckingGmail, 
    configError: authErrorMessage, 
    checkGmailConnection 
  } = useGmailConnection();
  
  const { getEmailContent } = useEmailContent({
    candidateName: candidate.name,
    jobTitle,
    templates,
    selectedTemplate
  });
  
  const { sendEmailViaGmail, isSending } = useEmailSender({
    onSuccessCallback: onSuccess
  });
  
  const { composeEmailInGmail, openThreadInGmail } = useGmailComposer();
  
  const { saveThreadId } = useCandidateThreads();
  
  const sendEmail = async () => {
    if (!candidate.email) {
      toast({
        title: "Cannot Send Email",
        description: "This candidate doesn't have an email address.",
        variant: "destructive"
      });
      return;
    }
    
    if (!templates || templates.length === 0) {
      console.error("No templates available when trying to send email");
      toast({
        title: "Cannot Send Email",
        description: "Email templates failed to load. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setErrorMessage(null);
      const { subject, body } = getEmailContent();
      
      if (!body || body.trim() === '') {
        toast({
          title: "Cannot Send Email",
          description: "The email body is empty. Please select a valid template.",
          variant: "destructive"
        });
        return;
      }
      
      // FIXED: Format the email subject consistently - no spaces before or after ITBC
      const formattedJobTitle = jobTitle ? jobTitle.trim() : '';
      const formattedSubject = `ITBC ${formattedJobTitle} ${candidate.name}`.trim();
      console.log("Sending email with subject:", formattedSubject);
      
      // Send the email
      const newThreadId = await sendEmailViaGmail({
        to: candidate.email,
        subject: formattedSubject,
        body,
        candidateName: candidate.name,
        jobTitle: formattedJobTitle,
        threadId
      });
      
      // If we got a new thread ID and it's different from the current one, save it
      if (jobId && newThreadId && (!threadId || newThreadId !== threadId)) {
        await saveThreadId({
          candidateId: candidate.id,
          threadIds: candidate.threadIds || {},
          jobId,
          newThreadId
        });
      }
    } catch (err: any) {
      console.error("Error in sendEmail:", err);
      setErrorMessage(err.message || "Failed to send email");
    }
  };

  const composeEmail = () => {
    if (!candidate.email) {
      toast({
        title: "Cannot Compose Email",
        description: "This candidate doesn't have an email address.",
        variant: "destructive"
      });
      return;
    }
    
    const { subject, body } = getEmailContent();
    
    if (!body || body.trim() === '') {
      toast({
        title: "Cannot Compose Email",
        description: "The email content is empty. Please select a valid template.",
        variant: "destructive"
      });
      return;
    }
    
    // FIXED: Format the email subject consistently - no spaces before or after ITBC
    const formattedJobTitle = jobTitle ? jobTitle.trim() : '';
    const formattedSubject = `ITBC ${formattedJobTitle} ${candidate.name}`.trim();
    
    composeEmailInGmail({
      to: candidate.email,
      subject: formattedSubject,
      body
    });
    
    onSuccess();
  };
  
  const openThreadInGmailSearch = () => {
    // FIXED: Format the email subject consistently - no spaces before or after ITBC
    const formattedJobTitle = jobTitle ? jobTitle.trim() : '';
    const formattedSubject = `ITBC ${formattedJobTitle} ${candidate.name}`.trim();
    openThreadInGmail(formattedSubject);
  };

  return {
    isSending,
    errorMessage: errorMessage || authErrorMessage,
    isCheckingGmail,
    isGmailConnected,
    sendEmailViaGmail: sendEmail,
    composeEmail,
    checkGmailConnection,
    getEmailContent,
    threadId,
    openThreadInGmail: openThreadInGmailSearch
  };
};
