import { useState, useEffect } from "react";
import { useGmailConnection } from "@/hooks/gmail";
import { useEmailSubject } from "@/hooks/email/useEmailSubject";
import { useEmailTemplate } from "@/hooks/email/useEmailTemplate";
import { useEmailSending } from "@/hooks/email/useEmailSending";
import { useGmailThread } from "@/hooks/email/useGmailThread";

interface UseEmailDialogStateProps {
  candidateName: string;
  candidateEmail?: string;
  jobId?: string;
  candidateFacingTitle?: string;
  candidateId?: string;
  threadId?: string | null;
  threadTitle?: string;
  onClose: () => void;
}

export const useEmailDialogState = ({
  candidateName,
  candidateEmail,
  jobId,
  candidateFacingTitle,
  candidateId,
  threadId,
  threadTitle,
  onClose,
}: UseEmailDialogStateProps) => {
  // Check localStorage first for Gmail connection status
  const savedConnectionStatus = localStorage.getItem('gmail_connected') === 'true';
  const [localConnectionStatus, setLocalConnectionStatus] = useState<boolean>(savedConnectionStatus);
  
  const {
    isConnected: apiConnectionStatus,
    connectGmail,
    checkGmailConnection,
  } = useGmailConnection({
    showLoadingUI: false,
  });
  
  // Use saved connection status or API status
  const isGmailConnected = localConnectionStatus || apiConnectionStatus;

  // Logging initialization
  useEffect(() => {
    console.group('Email Dialog State Initialization');
    console.log('Props received:', {
      candidateName: candidateName || 'MISSING',
      candidateEmail: candidateEmail || 'MISSING',
      jobId: jobId || 'MISSING',
      candidateFacingTitle: candidateFacingTitle || 'MISSING',
      candidateId: candidateId || 'MISSING',
      threadId: threadId || 'MISSING',
      threadTitle: threadTitle || 'MISSING',
      savedConnectionStatus
    });
    console.groupEnd();
    
    // Only check connection if we don't already have a saved connected status
    if (!savedConnectionStatus) {
      console.log("No saved connection status, checking Gmail connection...");
      // Background check only once and not on a timer
      checkGmailConnection().then(isConnected => {
        if (isConnected) {
          // Save successful connection to localStorage
          localStorage.setItem('gmail_connected', 'true');
          setLocalConnectionStatus(true);
        }
      }).catch((err) => {
        console.error("Background Gmail check failed:", err);
      });
    } else {
      console.log("Using saved Gmail connection status: connected");
    }
  }, [checkGmailConnection, candidateName, candidateEmail, jobId, candidateFacingTitle, candidateId, threadId, threadTitle, savedConnectionStatus]);

  // Use our hooks with proper logging - pass threadId to useEmailTemplate
  const { subject, setSubject } = useEmailSubject({
    candidateName,
    candidateFacingTitle,
    threadTitle
  });

  const { body, setBody, selectedTemplate, emailTemplates, handleTemplateChange } = useEmailTemplate({
    candidateName,
    jobTitle: candidateFacingTitle,
    threadId
  });

  useEffect(() => {
    console.log(`Email template state: template=${selectedTemplate}, bodyLength=${body?.length || 0}`);
  }, [selectedTemplate, body]);

  const { messageId, handleOpenThreadInGmail } = useGmailThread({
    candidateId,
    jobId,
    threadId
  });

  const { isSending, errorMessage, handleSendEmail, handleComposeInGmail } = useEmailSending({
    candidateId,
    candidateName,
    candidateEmail,
    jobId,
    candidateFacingTitle,
    threadId,
    messageId,
    onClose
  });

  // Custom connect function that updates local state
  const handleConnectGmail = async () => {
    try {
      await connectGmail();
      // When connection succeeds, update local state
      localStorage.setItem('gmail_connected', 'true');
      setLocalConnectionStatus(true);
    } catch (error) {
      console.error("Failed to connect Gmail:", error);
    }
  };

  return {
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
    handleSendEmail: () => handleSendEmail(subject, body),
    handleComposeInGmail: () => handleComposeInGmail(subject, body),
    handleOpenThreadInGmail: () => handleOpenThreadInGmail(subject),
    connectGmail: handleConnectGmail,
  };
};
