import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGmailAuth } from "@/hooks/useGmailAuth";
import { useEmailContent } from "@/hooks/useEmailContent";
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
  
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const sendEmailViaGmail = async () => {
    if (!candidate.email) {
      toast({
        title: "Cannot Send Email",
        description: "This candidate doesn't have an email address.",
        variant: "destructive"
      });
      return;
    }
    
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
    
    try {
      setIsSending(true);
      setErrorMessage(null);

      const subject = `ITBC ${jobTitle || ''} ${candidate.name}`.trim();
      console.log("Email subject:", subject);

      const cc = "recruitment@theitbc.com";

      const { data, error } = await supabase.functions.invoke('send-gmail', {
        body: {
          to: candidate.email,
          cc: cc,
          subject,
          body,
          candidateName: candidate.name,
          jobTitle,
          threadId,
          userId: user?.id
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Email Sent",
        description: `Your email to ${candidate.name} was sent successfully.`,
      });
      
      if (jobId && data?.threadId && (!threadId || data.threadId !== threadId)) {
        console.log("New thread ID created:", data.threadId);
        console.log("Saving thread ID for job:", jobId);
        
        const threadIdsUpdate = { ...(candidate.threadIds || {}), [jobId]: data.threadId };
        
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
          console.log("Thread ID saved for job:", jobId, "Thread ID:", data.threadId);
        }
      }
      
      onSuccess();
      return data?.threadId;
    } catch (err: any) {
      console.error("Error sending email:", err);
      setErrorMessage(err.message || "Failed to send email");
      toast({
        title: "Failed to send email",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSending(false);
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
    
    const formattedSubject = `ITBC ${jobTitle || ''} ${candidate.name}`.trim();
    
    composeEmailInGmail(candidate.email, formattedSubject, body);
    onSuccess();
  };
  
  const composeEmailInGmail = (email: string, subject: string, body: string) => {
    const cc = "recruitment@theitbc.com";
    const params = new URLSearchParams({
      to: email,
      cc: cc,
      subject: subject || "",
      body: body.replace(/<[^>]*>/g, '') // Strip HTML for mailto links
    });
    
    const composeUrl = `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
    window.open(composeUrl, '_blank');
  };

  return {
    isSending,
    errorMessage,
    isCheckingGmail,
    isGmailConnected,
    sendEmailViaGmail,
    composeEmail,
    checkGmailConnection,
    getEmailContent,
    threadId
  };
};
