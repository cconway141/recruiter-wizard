
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useGmailAuth } from "./useGmailAuth";

interface UseEmailSenderProps {
  onSuccess: () => void;
}

export const useEmailSender = ({ onSuccess }: UseEmailSenderProps) => {
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { checkGmailConnection, refreshGmailToken } = useGmailAuth();

  const sendEmailViaGmail = async (
    to: string,
    subject: string,
    body: string,
    candidateName: string,
    jobTitle: string | undefined,
    threadId: string | null
  ) => {
    if (!to || !user) return;
    
    setIsSending(true);
    setErrorMessage(null);
    
    try {
      const isConnected = await checkGmailConnection();
      
      if (!isConnected) {
        setErrorMessage("Gmail not connected. Please connect your Gmail account to send emails.");
        return;
      }
      
      console.log("Sending email to:", to);
      console.log("Subject:", subject);
      console.log("Thread ID:", threadId);
      
      // Always CC the recruitment team
      const cc = "recruitment@theitbc.com";
      
      const { data, error } = await supabase.functions.invoke('send-gmail', {
        body: {
          to,
          cc,
          subject,
          body,
          candidateName,
          jobTitle: jobTitle || '',
          threadId,
          userId: user.id
        }
      });
      
      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to call email function");
      }
      
      if (data?.error) {
        console.error("Email sending error:", data.error);
        
        if (data.error === "Gmail not connected") {
          throw new Error("Gmail not connected");
        } else if (data.error === "Gmail token expired") {
          const refreshSucceeded = await refreshGmailToken();
          if (refreshSucceeded) {
            setIsSending(false);
            return sendEmailViaGmail(to, subject, body, candidateName, jobTitle, threadId);
          }
        }
        
        throw new Error(data.error);
      }
      
      toast({
        title: "Email Sent",
        description: `Email was successfully sent to ${candidateName} and CC'd to recruitment@theitbc.com.`,
      });
      
      onSuccess();
      return data?.threadId || null;
    } catch (error: any) {
      console.error("Error sending email:", error);
      setErrorMessage(`Failed to send email: ${error.message}`);
      toast({
        title: "Email Failed",
        description: `Failed to send email: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSending(false);
    }
  };

  const composeEmailInGmail = (to: string, subject: string, body: string) => {
    // Always include CC in the compose URL
    const cc = "recruitment@theitbc.com";
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&cc=${encodeURIComponent(cc)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/<br>/g, '%0A').replace(/<[^>]*>/g, ''))}`;
    window.open(gmailUrl, '_blank');
  };

  return {
    isSending,
    errorMessage,
    sendEmailViaGmail,
    composeEmailInGmail
  };
};
