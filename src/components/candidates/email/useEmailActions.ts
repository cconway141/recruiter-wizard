
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailContentReturn {
  subject: string;
  body: string;
}

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
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Get thread ID for this candidate and job if it exists
  const threadId = candidate.threadIds?.[jobId || ''] || null;

  const getEmailContent = (): EmailContentReturn => {
    if (!candidate.email) return { subject: '', body: '' };
    
    // Default subject and body
    let subject = jobTitle ? `Regarding ${jobTitle} position` : `Regarding your application`;
    let body = `Hello ${candidate.name},<br><br>I hope this email finds you well.`;
    
    // If a template is selected, use its content
    if (selectedTemplate && selectedTemplate !== "custom") {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        body = template.message.replace(/\[First Name\]/g, candidate.name.split(' ')[0]);
      }
    }
    
    return { subject, body };
  };

  const sendEmailViaGmail = async () => {
    if (!candidate.email) return;
    
    setIsSending(true);
    setErrorMessage(null);
    
    try {
      const { subject, body } = getEmailContent();
      
      console.log("Sending email to:", candidate.email);
      console.log("Subject:", subject);
      console.log("Thread ID:", threadId);
      
      // Call our Supabase edge function to send the email via Gmail API
      const { data, error } = await supabase.functions.invoke('send-gmail', {
        body: {
          to: candidate.email,
          subject,
          body,
          candidateName: candidate.name,
          jobTitle: jobTitle || '',
          threadId
        }
      });
      
      console.log("Email function response:", data);
      
      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to call email function");
      }
      
      if (data?.error) {
        console.error("Email sending error:", data.error);
        throw new Error(data.error);
      }

      // Store the thread ID for future reference if this is a new thread
      if (data?.threadId && jobId && (!threadId || data.threadId !== threadId)) {
        console.log("New thread ID created:", data.threadId);
        
        // Update the candidate in Supabase with the new thread ID
        const threadIdsUpdate = { ...(candidate.threadIds || {}), [jobId]: data.threadId };
        
        // Use a simple update structure with type assertions
        const { error: updateError } = await supabase
          .from('candidates')
          .update({
            thread_ids: threadIdsUpdate
          } as any)
          .eq('id', candidate.id);
          
        if (updateError) {
          console.error("Error updating candidate thread ID:", updateError);
          // Continue anyway as the email was sent successfully
        }
      }
      
      toast({
        title: "Email Sent",
        description: `Email was successfully sent to ${candidate.name}.`,
      });
      
      // Close the dialog
      onSuccess();
    } catch (error: any) {
      console.error("Error sending email:", error);
      setErrorMessage(`Failed to send email: ${error.message}`);
      toast({
        title: "Email Failed",
        description: `Failed to send email: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const composeEmail = () => {
    if (!candidate.email) return;
    
    // Get the template content if a template is selected
    const { subject, body } = getEmailContent();
    
    // Create Gmail compose URL with prefilled fields
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(candidate.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/<br>/g, '%0A').replace(/<[^>]*>/g, ''))}`;
    
    // Open Gmail in a new tab
    window.open(gmailUrl, '_blank');
    
    // Close the dialog
    onSuccess();
  };

  return {
    isSending,
    errorMessage,
    sendEmailViaGmail,
    composeEmail
  };
};
