
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGmailAuth } from "@/hooks/useGmailAuth";
import { useEmailContent } from "@/hooks/useEmailContent";
import { useToast } from "@/hooks/use-toast";

interface EmailActionOptions {
  candidateName: string;
  candidateEmail: string;
  jobTitle?: string;
  selectedTemplate: string;
  templates: any[];
  jobId?: string;
  candidateId?: string;
  threadId?: string | null;
  threadTitle?: string;
}

export const useEmailActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const resetState = () => {
    setError(null);
  };

  const sendEmail = async (options: EmailActionOptions) => {
    const {
      candidateName,
      candidateEmail,
      jobTitle,
      selectedTemplate,
      templates,
      jobId,
      candidateId,
      threadId,
      threadTitle
    } = options;

    if (!candidateEmail) {
      setError("No email address provided");
      return null;
    }
    
    if (!templates || templates.length === 0) {
      setError("No email templates available");
      return null;
    }
    
    try {
      setIsSending(true);
      setError(null);
      
      // Use a hardcoded subject if not available from the content
      const subject = threadTitle || `ITBC ${jobTitle || ''} - ${candidateName}`;
      
      // Get email content from a hypothetical hook
      const { getEmailContent } = useEmailContent({ 
        candidateName, 
        jobTitle, 
        templates, 
        selectedTemplate 
      });
      
      const { body } = getEmailContent();
      
      if (!body || body.trim() === '') {
        throw new Error("Email body is empty");
      }
      
      const { data, error: sendError } = await supabase.functions.invoke('send-gmail', {
        body: {
          to: candidateEmail,
          subject,
          body,
          candidateName,
          jobTitle,
          threadId,
          userId: user?.id
        }
      });
      
      if (sendError) {
        throw sendError;
      }
      
      toast({
        title: "Email sent",
        description: `Your email to ${candidateName} was sent successfully.`
      });
      
      return data?.threadId;
    } catch (err: any) {
      console.error("Error sending email:", err);
      setError(err.message || "Failed to send email");
      toast({
        title: "Failed to send email",
        description: err.message || "An error occurred while sending the email",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSending(false);
    }
  };
  
  const composeEmailInGmail = (email: string, subject: string, body: string) => {
    // Create a Gmail compose URL
    const params = new URLSearchParams({
      to: email,
      subject: subject || "",
      body: body.replace(/<[^>]*>/g, '') // Strip HTML for mailto links
    });
    
    const composeUrl = `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`;
    window.open(composeUrl, '_blank');
  };

  return {
    sendEmail,
    composeEmailInGmail,
    isSending,
    error,
    resetState
  };
};
