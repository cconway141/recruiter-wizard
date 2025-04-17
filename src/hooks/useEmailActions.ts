
import { useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEmailSender } from "@/hooks/email/useEmailSender";
import { useEmailContent } from "@/hooks/useEmailContent";
import { useGmailConnection } from "@/contexts/GmailConnectionContext";

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
  
  // Get connection status from our centralized context
  const { 
    isConnected: isGmailConnected,
    isLoading: isCheckingGmail,
    checkConnection: checkGmailConnection,
  } = useGmailConnection();
  
  const { sendEmailViaGmail: sendEmail, composeEmailInGmail } = useEmailSender({
    onSuccess
  });
  
  const { getEmailContent, emailTemplates } = useEmailContent({
    candidateName,
    jobTitle,
    selectedTemplate
  });
  
  // Do a single check on mount to ensure connection status is current
  useEffect(() => {
    if (user) {
      checkGmailConnection().catch(err => {
        console.error("Email component Gmail check failed:", err);
        // Don't set error message for background checks
      });
    }
  }, [user, checkGmailConnection]);

  // Memoize data used by the sendEmailViaGmail function
  const emailData = useMemo(() => ({
    candidateEmail,
    candidateName,
    isGmailConnected,
    jobTitle
  }), [candidateEmail, candidateName, isGmailConnected, jobTitle]);

  const sendEmailViaGmail = useCallback(async () => {
    const { candidateEmail, candidateName, isGmailConnected, jobTitle } = emailData;
    
    if (!candidateEmail) {
      const noEmailError = "No email address provided for this candidate";
      setErrorMessage(noEmailError);
      toast({
        title: "Email Error",
        description: noEmailError,
        variant: "destructive"
      });
      return null;
    }
    
    if (!isGmailConnected) {
      const notConnectedError = "Gmail is not connected. Please connect your Gmail account first.";
      setErrorMessage(notConnectedError);
      toast({
        title: "Gmail Not Connected",
        description: notConnectedError,
        variant: "destructive"
      });
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
      const errorMsg = error instanceof Error ? error.message : "Failed to send email";
      setErrorMessage(errorMsg);
      toast({
        title: "Email Error",
        description: errorMsg,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSending(false);
    }
  }, [
    emailData,
    getEmailContent,
    selectedTemplate,
    sendEmail,
    threadId,
    toast
  ]);

  // Clean up any state or listeners on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending operations if component unmounts during send
      if (isSending) {
        console.log("Component unmounted during email send - cleaning up");
        setIsSending(false);
      }
    };
  }, [isSending]);

  return {
    sendEmailViaGmail,
    composeEmailInGmail,
    isGmailConnected,
    isLoading: isCheckingGmail,
    isSending,
    errorMessage, 
    checkGmailConnection,
    emailTemplates
  };
};

export default useEmailActions;
