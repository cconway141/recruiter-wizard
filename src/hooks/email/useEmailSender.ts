
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useGmailConnection } from "@/contexts/GmailConnectionContext";

interface UseEmailSenderProps {
  onSuccess?: () => void;
}

export const useEmailSender = ({ onSuccess }: UseEmailSenderProps = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const { isConnected } = useGmailConnection();

  const sendEmailViaGmail = useCallback(async (
    to: string,
    subject: string,
    body: string,
    candidateName?: string,
    jobTitle?: string,
    threadId?: string | null
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to send emails.",
        variant: "destructive"
      });
      return null;
    }

    if (!isConnected) {
      toast({
        title: "Gmail Not Connected",
        description: "Please connect your Gmail account to send emails.",
        variant: "destructive"
      });
      return null;
    }

    try {
      setIsSending(true);

      // Use the edge function to send the email with proper error handling
      const { data, error } = await supabase.functions.invoke('send-gmail', {
        body: {
          to,
          subject,
          html: body,
          threadId: threadId || undefined,
          userId: user.id,
          metadata: {
            candidateName,
            jobTitle
          }
        }
      });

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Success notification
      toast({
        title: "Email Sent",
        description: `Email successfully sent to ${to}.`,
      });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      return data;
    } catch (error) {
      console.error("Error sending email:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send email";
      
      toast({
        title: "Email Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsSending(false);
    }
  }, [user, isConnected, toast, onSuccess]);

  const composeEmailInGmail = useCallback(async (
    to: string,
    subject: string,
    body: string
  ) => {
    try {
      // Create a Gmail compose URL with the email details
      const composeUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/<[^>]*>/g, ''))}`;
      
      // Open Gmail compose in a new tab
      window.open(composeUrl, '_blank');
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error) {
      console.error("Error opening Gmail compose:", error);
      
      toast({
        title: "Error",
        description: "Failed to open Gmail compose window",
        variant: "destructive"
      });
      
      return false;
    }
  }, [toast, onSuccess]);

  return {
    sendEmailViaGmail,
    composeEmailInGmail,
    isSending
  };
};
