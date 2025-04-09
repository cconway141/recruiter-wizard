
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGmailAuth } from "@/hooks/useGmailAuth";
import { useEmailContent } from "@/hooks/useEmailContent";
import { useEmailSender } from "@/hooks/useEmailSender";

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
  // Get thread ID for this specific job if it exists
  const threadId = candidate.threadIds?.[jobId || ''] || null;
  const { user } = useAuth();
  
  const { 
    isGmailConnected, 
    isCheckingGmail, 
    errorMessage: authErrorMessage, 
    checkGmailConnection 
  } = useGmailAuth();
  
  const { getEmailContent } = useEmailContent({
    candidateName: candidate.name,
    jobTitle,
    templates,
    selectedTemplate
  });
  
  const { 
    isSending, 
    errorMessage: sendErrorMessage, 
    sendEmailViaGmail: sendEmail, 
    composeEmailInGmail 
  } = useEmailSender({ onSuccess });
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Sync error messages from child hooks
  useEffect(() => {
    setErrorMessage(authErrorMessage || sendErrorMessage);
  }, [authErrorMessage, sendErrorMessage]);

  const sendEmailViaGmail = async () => {
    if (!candidate.email) return;
    
    const { subject, body } = getEmailContent();
    
    console.log("Sending email with thread ID:", threadId);
    
    const newThreadId = await sendEmail(
      candidate.email,
      subject,
      body,
      candidate.name,
      jobTitle,
      threadId
    );
    
    // Update candidate's thread ID if a new one was created
    if (newThreadId && jobId && (!threadId || newThreadId !== threadId)) {
      console.log("New thread ID created:", newThreadId);
      
      const threadIdsUpdate = { ...(candidate.threadIds || {}), [jobId]: newThreadId };
      
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          thread_ids: threadIdsUpdate
        })
        .eq('id', candidate.id);
        
      if (updateError) {
        console.error("Error updating candidate thread ID:", updateError);
      } else {
        console.log("Thread ID saved for future emails:", newThreadId);
      }
    }
  };

  const composeEmail = () => {
    if (!candidate.email) return;
    
    const { subject, body } = getEmailContent();
    composeEmailInGmail(candidate.email, subject, body);
    onSuccess();
  };

  return {
    isSending,
    errorMessage,
    isCheckingGmail,
    isGmailConnected,
    sendEmailViaGmail,
    composeEmail,
    checkGmailConnection
  };
};
