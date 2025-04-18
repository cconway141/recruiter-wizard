
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
  messageId?: string | null;
  selectedTemplate?: string;
  onSuccess?: () => void;
}

export const useEmailActions = ({
  candidateName = '',
  candidateEmail = '',
  jobId,
  jobTitle,
  threadId,
  messageId,
  selectedTemplate = 'default',
  onSuccess,
}: UseEmailActionsProps = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCheckingGmail, setIsCheckingGmail] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  
  // Get connection status from localStorage if available to reduce API calls
  const cachedConnection = localStorage.getItem('gmail_connected') === 'true';
  const [hasCachedConnection, setHasCachedConnection] = useState(cachedConnection);
  
  const { 
    isConnected: apiConnectionStatus, 
    isLoading: isConnectionLoading,
    checkGmailConnection,
  } = useGmailConnection({
    showLoadingUI: false, // Prevent blocking UI with loading states
  });
  
  // Use cached status or API status
  const isGmailConnected = hasCachedConnection || apiConnectionStatus;
  
  const { sendEmailViaGmail: sendEmail, composeEmailInGmail } = useEmailSender({
    onSuccess
  });
  
  const { getEmailContent, emailTemplates } = useEmailContent({
    candidateName,
    jobTitle,
    selectedTemplate
  });
  
  // Check Gmail connection on mount ONLY ONCE with significant throttling
  useEffect(() => {
    if (!user) return;
    
    // If we already have a cached connection, skip the check
    if (hasCachedConnection) {
      return;
    }
    
    const now = Date.now();
    // Only check if it's been more than 2 minutes since last check
    if (now - lastCheckTime > 120000) {
      setIsCheckingGmail(true);
      checkGmailConnection()
        .then(isConnected => {
          if (isConnected) {
            // Cache connection status to avoid future checks
            localStorage.setItem('gmail_connected', 'true');
            setHasCachedConnection(true);
          }
        })
        .catch(err => {
          console.error("Gmail connection check failed:", err);
          // Don't set error message for connection checks
        })
        .finally(() => {
          setIsCheckingGmail(false);
          setLastCheckTime(now);
        });
    }
  }, [user, checkGmailConnection, lastCheckTime, hasCachedConnection]);

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
        threadId,
        messageId
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
    messageId,
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
    isLoading: isCheckingGmail || isConnectionLoading,
    isSending,
    errorMessage, 
    checkGmailConnection,
    emailTemplates
  };
};

export default useEmailActions;
