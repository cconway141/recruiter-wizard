
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
}

export const useEmailActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (options: EmailActionOptions) => {
    const {
      candidateName,
      candidateEmail,
      jobTitle,
      selectedTemplate,
      templates,
      jobId,
      candidateId,
      threadId
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
      
      // Generate a unique subject line per candidate-job combination
      const subject = `ITBC ${jobTitle || ''} - ${candidateName}`.trim();
      
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
          jobId,  // Pass job ID to help with thread tracking
          userId: user?.id
        }
      });
      
      if (sendError) {
        throw sendError;
      }
      
      // Update thread ID for this candidate-job combination if a new thread was created
      if (jobId && data?.threadId && (!threadId || data.threadId !== threadId)) {
        await supabase
          .from('candidates')
          .update({ thread_ids: { [jobId]: data.threadId } })
          .eq('id', candidateId);
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

  return {
    sendEmail,
    isSending,
    error
  };
};
