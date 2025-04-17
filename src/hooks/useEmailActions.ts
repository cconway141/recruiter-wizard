
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useGmailConnection } from "@/hooks/gmail";
import { useEmailSender } from "@/hooks/email/useEmailSender";
import { useEmailContent } from "@/hooks/useEmailContent";

interface UseEmailActionsProps {
  candidateName?: string;
  candidateEmail?: string;
  jobId?: string;
  jobTitle?: string;
  threadId?: string | null;
  selectedTemplate?: string;
  onSuccess?: () => void;
}

export const useEmailActions = ({
  candidateName = '',
  candidateEmail = '',
  jobId,
  jobTitle,
  threadId,
  selectedTemplate = 'default',
  onSuccess,
}: UseEmailActionsProps = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCheckingGmail, setIsCheckingGmail] = useState(false);
  
  const { isConnected: isGmailConnected, checkGmailConnection } = useGmailConnection();
  
  const { sendEmailViaGmail: sendEmail, composeEmailInGmail } = useEmailSender({
    onSuccess
  });
  
  const { getEmailContent, emailTemplates } = useEmailContent({
    candidateName,
    jobTitle,
    selectedTemplate
  });
  
  // Check Gmail connection on mount
  useEffect(() => {
    if (user) {
      setIsCheckingGmail(true);
      checkGmailConnection().finally(() => {
        setIsCheckingGmail(false);
      });
    }
  }, [checkGmailConnection, user]);

  const sendEmailViaGmail = useCallback(async () => {
    if (!candidateEmail) {
      setErrorMessage("No email address provided for this candidate");
      return null;
    }
    
    if (!isGmailConnected) {
      setErrorMessage("Gmail is not connected. Please connect your Gmail account first.");
      return null;
    }
    
    try {
      setIsSending(true);
      setErrorMessage(null);
      
      const { body, subject } = getEmailContent(selectedTemplate);
      const finalSubject = threadId ? undefined : (subject || `${jobTitle || ''} - ${candidateName}`);
      
      return await sendEmail(
        candidateEmail,
        finalSubject || `ITBC ${jobTitle || ''} - ${candidateName}`,
        body,
        candidateName,
        jobTitle,
        threadId
      );
    } catch (error) {
      console.error("Error sending email:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to send email");
      return null;
    } finally {
      setIsSending(false);
    }
  }, [
    candidateEmail,
    candidateName,
    checkGmailConnection,
    composeEmailInGmail,
    getEmailContent,
    isGmailConnected,
    jobTitle,
    onSuccess,
    selectedTemplate,
    sendEmail,
    threadId
  ]);

  return {
    sendEmailViaGmail,
    composeEmailInGmail,
    isGmailConnected,
    isLoading: isCheckingGmail,
    isSending,
    errorMessage, 
    checkGmailConnection
  };
};

export default useEmailActions;
