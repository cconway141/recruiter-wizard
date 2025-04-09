
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGmailAuth } from "@/hooks/useGmailAuth";
import { useEmailContent } from "@/hooks/useEmailContent";
import { useEmailSender } from "@/hooks/useEmailSender";
import { useToast } from "@/hooks/use-toast";

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
  const threadId = jobId && candidate.threadIds ? candidate.threadIds[jobId] || null : null;
  const { user } = useAuth();
  const { toast } = useToast();
  
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
  
  // Log when templates change for debugging
  useEffect(() => {
    if (templates && templates.length > 0) {
      console.log(`useEmailActions has ${templates.length} templates, selected: ${selectedTemplate}`);
    }
  }, [templates, selectedTemplate]);
  
  // Sync error messages from child hooks
  useEffect(() => {
    setErrorMessage(authErrorMessage || sendErrorMessage);
  }, [authErrorMessage, sendErrorMessage]);

  const sendEmailViaGmail = async () => {
    if (!candidate.email) {
      toast({
        title: "Cannot Send Email",
        description: "This candidate doesn't have an email address.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate templates are loaded
    if (!templates || templates.length === 0) {
      console.error("No templates available when trying to send email");
      toast({
        title: "Cannot Send Email",
        description: "Email templates failed to load. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    const { subject, body } = getEmailContent();
    
    // Log what's being sent for debugging
    console.log("Sending email to:", candidate.email);
    console.log("Subject:", subject);
    console.log("Thread ID:", threadId);
    console.log("Body length:", body.length);
    console.log("Selected template:", selectedTemplate);
    console.log("Body preview:", body.substring(0, 100));
    console.log("Template count:", templates.length);
    
    if (!body || body.trim() === '') {
      toast({
        title: "Cannot Send Email",
        description: "The email body is empty. Please select a valid template.",
        variant: "destructive"
      });
      return;
    }
    
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
      console.log("Saving thread ID for job:", jobId);
      
      const threadIdsUpdate = { ...(candidate.threadIds || {}), [jobId]: newThreadId };
      
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          thread_ids: threadIdsUpdate
        })
        .eq('id', candidate.id);
        
      if (updateError) {
        console.error("Error updating candidate thread ID:", updateError);
        toast({
          title: "Warning",
          description: "Email sent, but failed to save thread ID for future emails.",
          variant: "destructive"
        });
      } else {
        console.log("Thread ID saved for job:", jobId, "Thread ID:", newThreadId);
      }
    }
  };

  const composeEmail = () => {
    if (!candidate.email) {
      toast({
        title: "Cannot Compose Email",
        description: "This candidate doesn't have an email address.",
        variant: "destructive"
      });
      return;
    }
    
    const { subject, body } = getEmailContent();
    
    if (!body || body.trim() === '') {
      toast({
        title: "Cannot Compose Email",
        description: "The email content is empty. Please select a valid template.",
        variant: "destructive"
      });
      return;
    }
    
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
    checkGmailConnection,
    // Return these for debugging
    getEmailContent,
    threadId
  };
};
