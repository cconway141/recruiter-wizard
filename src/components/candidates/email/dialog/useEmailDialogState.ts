
import { useEffect, useRef } from "react";
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
  const hasLoggedRef = useRef(false);
  const hasCheckedConnectionRef = useRef(false);
  
  const {
    isConnected: isGmailConnected,
    connectGmail,
    checkGmailConnection,
  } = useGmailConnection({
    showLoadingUI: false,
  });

  // Logging initialization - only once
  useEffect(() => {
    if (hasLoggedRef.current) return;
    hasLoggedRef.current = true;
    
    console.group('Email Dialog State Initialization');
    console.log('Props received:', {
      candidateName: candidateName || 'MISSING',
      candidateEmail: candidateEmail || 'MISSING',
      jobId: jobId || 'MISSING',
      candidateFacingTitle: candidateFacingTitle || 'MISSING',
      candidateId: candidateId || 'MISSING',
      threadId: threadId || 'MISSING',
      threadTitle: threadTitle || 'MISSING',
    });
    console.groupEnd();
  }, [candidateName, candidateEmail, jobId, candidateFacingTitle, candidateId, threadId, threadTitle]);

  // Background check for Gmail connection - only once
  useEffect(() => {
    if (hasCheckedConnectionRef.current) return;
    hasCheckedConnectionRef.current = true;
    
    // Only check after a delay and only once
    const timer = setTimeout(() => {
      checkGmailConnection().catch((err) => {
        console.error("Background Gmail check failed:", err);
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [checkGmailConnection]);

  // Use our hooks with proper logging
  const { subject, setSubject } = useEmailSubject({
    candidateName,
    candidateFacingTitle,
    threadTitle
  });

  const { body, setBody, selectedTemplate, emailTemplates, handleTemplateChange } = useEmailTemplate({
    candidateName,
    jobTitle: candidateFacingTitle
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
    connectGmail,
  };
};
