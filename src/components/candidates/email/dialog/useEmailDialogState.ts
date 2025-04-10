
import { useEffect, useRef, useState } from "react";
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
  const [connectionChecked, setConnectionChecked] = useState(false);
  
  // Enhanced Gmail connection with better connection handler
  const {
    isConnected: isGmailConnected,
    connectGmail,
    checkGmailConnection,
    silentCheckConnection,
  } = useGmailConnection({
    showLoadingUI: false,
    onConnectionChange: (connected) => {
      if (connected) {
        // Immediately cache connection status when changed
        try {
          sessionStorage.setItem('gmail_connection_status', 'true');
          localStorage.setItem('gmail_connected', 'true');
          sessionStorage.setItem('gmail_connection_check_time', Date.now().toString());
        } catch (e) {
          console.warn("Failed to cache Gmail connection status:", e);
        }
      }
    }
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

  // Improved connection check with better caching logic
  useEffect(() => {
    if (hasCheckedConnectionRef.current || connectionChecked) return;
    
    // First check URL parameters (highest priority for post-auth)
    const urlParams = new URLSearchParams(window.location.search);
    const gmailConnected = urlParams.get('gmail_connected');
    
    if (gmailConnected === 'true') {
      console.log("Gmail connected based on URL parameter");
      hasCheckedConnectionRef.current = true;
      setConnectionChecked(true);
      
      try {
        // Update cached status
        sessionStorage.setItem('gmail_connection_status', 'true');
        localStorage.setItem('gmail_connected', 'true');
        sessionStorage.setItem('gmail_connection_check_time', Date.now().toString());
      } catch (e) {
        console.warn("Failed to cache Gmail connection status:", e);
      }
      
      return;
    }
    
    // Check if we already have a stored connection state
    const cachedStatus = sessionStorage.getItem('gmail_connection_status');
    const localStatus = localStorage.getItem('gmail_connected');
    
    if (cachedStatus === 'true' || localStatus === 'true') {
      console.log("Using cached Gmail connection status: connected");
      hasCheckedConnectionRef.current = true;
      setConnectionChecked(true);
      return;
    }
    
    // Only check after a delay and only once
    const timer = setTimeout(() => {
      hasCheckedConnectionRef.current = true;
      
      silentCheckConnection()
        .then(isConnected => {
          console.log("Background Gmail connection check result:", isConnected);
          // Cache the result to prevent redundant checks
          try {
            sessionStorage.setItem('gmail_connection_status', isConnected.toString());
            sessionStorage.setItem('gmail_connection_check_time', Date.now().toString());
            if (isConnected) {
              localStorage.setItem('gmail_connected', 'true');
            }
          } catch (e) {
            console.warn("Failed to cache Gmail connection status:", e);
          }
          setConnectionChecked(true);
        })
        .catch((err) => {
          console.error("Background Gmail check failed:", err);
          setConnectionChecked(true);
        });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [silentCheckConnection, connectionChecked]);

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
