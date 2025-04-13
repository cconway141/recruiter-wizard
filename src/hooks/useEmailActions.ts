
import { useState, useCallback, useEffect, useMemo } from "react";
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
  const [lastCheckTime, setLastCheckTime] = useState(0);
  
  const { 
    isConnected: isGmailConnected, 
    checkGmailConnection,
    // Handle the case where connectionCheckInProgress might not exist
    // by providing a fallback value
  } = useGmailConnection();
  
  const { sendEmailViaGmail: sendEmail, composeEmailInGmail } = useEmailSender({
    onSuccess
  });
  
  const { getEmailContent, emailTemplates } = useEmailContent({
    candidateName,
    jobTitle,
    selectedTemplate
  });
  
  // Check Gmail connection on mount with throttling to prevent excessive checks
  useEffect(() => {
    if (!user) return;
    
    const now = Date.now();
    // Only check if it's been more than 30 seconds since last check
    if (now - lastCheckTime > 30000) {
      setIsCheckingGmail(true);
      checkGmailConnection()
        .catch(err => {
          console.error("Gmail connection check failed:", err);
          // Don't set error message for connection checks
        })
        .finally(() => {
          setIsCheckingGmail(false);
          setLastCheckTime(now);
        });
    }
  }, [user, checkGmailConnection, lastCheckTime]);

  // Memoize data used by the sendEmailViaGmail function to prevent recreating it unnecessarily
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
