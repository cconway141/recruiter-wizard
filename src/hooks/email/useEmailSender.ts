
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useGmailConnection } from "@/hooks/gmail";

interface UseEmailSenderProps {
  onSuccess?: () => void;
}

export const useEmailSender = ({ onSuccess }: UseEmailSenderProps = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { refreshGmailToken } = useGmailConnection();

  const sendEmailViaGmail = async (
    to: string,
    subject: string,
    body: string,
    candidateName: string,
    jobTitle?: string,
    threadId?: string | null,
    messageId?: string | null
  ) => {
    if (!to || !user) {
      const error = "Missing recipient email or user not logged in";
      setErrorMessage(error);
      throw new Error(error);
    }
    
    if (!body.trim()) {
      const error = "Email body cannot be empty";
      setErrorMessage(error);
      throw new Error(error);
    }
    
    try {
      setIsSending(true);
      setErrorMessage(null);
      console.log("Sending email to:", to);
      console.log("Using subject:", subject);
      console.log("Thread ID:", threadId || "New thread");
      console.log("Message ID:", messageId || "New message");
      console.log("Job Title:", jobTitle || "No job title provided");
      
      // Validate job title is present for new threads
      if (!threadId && !jobTitle) {
        console.warn("Creating new email thread without job title");
      }
      
      // Always CC the recruitment team
      const cc = "recruitment@theitbc.com";
      
      // Format and clean the thread ID and message ID - ensure they're valid strings
      const cleanThreadId = threadId && typeof threadId === 'string' && threadId.trim() !== "" ? 
        threadId.trim() : undefined;
        
      const cleanMessageId = messageId && typeof messageId === 'string' && messageId.trim() !== "" ? 
        messageId.trim() : undefined;
        
      console.log("Using cleaned thread ID:", cleanThreadId || "New thread");
      console.log("Using cleaned message ID:", cleanMessageId || "New message");
      
      const { data, error } = await supabase.functions.invoke('send-gmail', {
        body: {
          to,
          cc,
          subject,
          body,
          candidateName,
          jobTitle: jobTitle || '',
          threadId: cleanThreadId,
          messageId: cleanMessageId,
          userId: user.id
        }
      });
      
      if (error) {
        console.error("Function error:", error);
        throw new Error(error.message || "Failed to send email");
      }
      
      if (data?.error) {
        console.error("Email sending error:", data.error);
        
        // Handle token expiration
        if (data.error.includes("token expired") || data.error.includes("not connected")) {
          const refreshed = await refreshGmailToken();
          if (refreshed) {
            // Try again with refreshed token
            return sendEmailViaGmail(to, subject, body, candidateName, jobTitle, threadId, messageId);
          }
        }
        
        throw new Error(data.error);
      }
      
      console.log("Email sent successfully:", data);
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Return both thread ID and message ID
      return {
        threadId: data?.threadId,
        messageId: data?.messageId
      };
    } catch (error) {
      console.error("Error sending email:", error);
      const message = error instanceof Error ? error.message : "Failed to send email";
      setErrorMessage(message);
      throw new Error(message);
    } finally {
      setIsSending(false);
    }
  };

  const composeEmailInGmail = (
    to: string,
    subject: string,
    body: string,
    candidateName: string,
    jobTitle?: string,
    threadId?: string | null
  ) => {
    try {
      const cc = "recruitment@theitbc.com";
      const bodyEncoded = encodeURIComponent(body);
      const subjectEncoded = encodeURIComponent(subject);
      const toEncoded = encodeURIComponent(to);
      const ccEncoded = encodeURIComponent(cc);
      
      // Log that we're opening Gmail compose
      console.log("Opening Gmail compose with:", {
        to,
        subject,
        jobTitle: jobTitle || "No job title provided",
        candidateName
      });
      
      const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${toEncoded}&cc=${ccEncoded}&su=${subjectEncoded}&body=${bodyEncoded}`;
      
      window.open(gmailComposeUrl, '_blank');
      
      return true;
    } catch (error) {
      console.error("Error opening Gmail compose:", error);
      toast({
        title: "Error",
        description: "Could not open Gmail compose window",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    sendEmailViaGmail,
    composeEmailInGmail,
    isSending,
    errorMessage
  };
};
