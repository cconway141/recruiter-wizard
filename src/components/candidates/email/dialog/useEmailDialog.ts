
import { useState, useEffect } from "react";
import { useEmailDialogState } from "./useEmailDialogState";
import { useToast } from "@/hooks/use-toast";

interface UseEmailDialogProps {
  candidateName: string;
  candidateEmail?: string;
  jobId?: string;
  candidateFacingTitle?: string;
  candidateId?: string;
  threadId?: string | null;
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
  threadTitle,
  onClose,
}: UseEmailDialogProps) => {
  const { toast } = useToast();
  
  // Log all props to help debug
  console.group('useEmailDialog Hook');
  console.log('Props received in useEmailDialog:', {
    candidateName,
    candidateEmail,
    jobId,
    candidateFacingTitle, // Log to verify it's passed correctly
    candidateId,
    threadId,
    threadTitle
  });
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
    candidateFacingTitle, // Pass the correct prop directly
    candidateId,
    threadId,
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
