
import { useState, useEffect, useCallback } from "react";
import { useGmailConnection } from "@/hooks/gmail/useGmailConnection";
import { useGmailConnectionStatus } from "@/hooks/gmail/useGmailConnectionStatus";
import { useEmailTemplate } from "@/hooks/email/useEmailTemplate";
import { useEmailSubject } from "@/hooks/email/useEmailSubject";
import { useEmailSending } from "@/hooks/email/useEmailSending";
import { useGmailThread } from "@/hooks/email/useGmailThread";
import { useGmailComposer } from "@/hooks/email/useGmailComposer";

export interface UseEmailDialogProps {
  candidateName: string;
  candidateEmail?: string;
  jobId?: string;
  candidateFacingTitle?: string;
  candidateId?: string;
  threadId?: string | null;
  messageId?: string | null;
  threadTitle?: string;
  onClose: () => void;
}

export const useEmailDialog = ({
  candidateName,
  candidateEmail,
  jobId,
  candidateFacingTitle,
  candidateId,
  threadId,
  messageId,
  threadTitle,
  onClose,
}: UseEmailDialogProps) => {
  const { toast } = useToast();
  
  console.group('useEmailDialog Hook');
  console.log('Props received in useEmailDialog:', {
    candidateName,
    candidateEmail,
    jobId,
    candidateFacingTitle,
    candidateId,
    threadId,
    threadTitle
  });
  
  // Filter out "new email" placeholder from threadId
  // This is important for proper thread handling
  const cleanedThreadId = threadId && threadId !== "new email" ? threadId : null;
  
  // Validate that we have a job title
  if (!candidateFacingTitle) {
    console.error("ERROR: No job title provided to useEmailDialog. This should never happen.");
  }
  
  console.groupEnd();
  
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
  } = useEmailDialogState({
    candidateName,
    candidateEmail,
    jobId,
    candidateFacingTitle, // Pass the job title directly
    candidateId,
    threadId: cleanedThreadId, // Pass cleaned threadId instead of raw value
    threadTitle,
    onClose,
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
    handleSendEmail,
    handleComposeInGmail,
    handleOpenThreadInGmail,
    connectGmail,
  };
};
