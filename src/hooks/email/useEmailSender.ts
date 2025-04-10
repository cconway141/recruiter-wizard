
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SendEmailOptions {
  to: string;
  cc?: string;
  subject: string;
  body: string;
  candidateName: string;
  jobTitle?: string;
  threadId?: string | null;
}

interface UseEmailSenderProps {
  onSuccessCallback?: () => void;
}

export const useEmailSender = ({ onSuccessCallback }: UseEmailSenderProps = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sendEmailViaGmail = async ({
    to,
    cc = "recruitment@theitbc.com",
    subject,
    body,
    candidateName,
    jobTitle,
    threadId
  }: SendEmailOptions) => {
    if (!to || !user) {
      toast({
        title: "Cannot Send Email",
        description: "Missing recipient email or user not authenticated.",
        variant: "destructive"
      });
      return null;
    }
    
    if (body.trim() === '') {
      toast({
        title: "Cannot Send Email",
        description: "The email body is empty. Please select a valid template.",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      setIsSending(true);
      setErrorMessage(null);
      
      console.log("Sending email to:", to);
      console.log("Subject:", subject);
      console.log("Thread ID:", threadId);
      console.log("Body length:", body.length);
      
      const { data, error } = await supabase.functions.invoke('send-gmail', {
        body: {
          to,
          cc,
          subject,
          body,
          candidateName,
          jobTitle,
          threadId,
          userId: user.id
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Email Sent",
        description: `Your email to ${candidateName} was sent successfully.`,
      });
      
      if (onSuccessCallback) {
        onSuccessCallback();
      }
      
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

  return {
    sendEmailViaGmail,
    isSending,
    errorMessage
  };
};
