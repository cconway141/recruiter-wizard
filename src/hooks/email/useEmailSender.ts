
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useGmailConnection } from "@/hooks/gmail";

interface UseEmailSenderProps {
  onSuccess?: () => void;
}

interface EmailResult {
  threadId: string;
  messageId: string;
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
    jobTitle: string = "", 
    threadId?: string | null,
    messageId?: string | null
  ): Promise<EmailResult | null> => {
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
      
      // Always CC the recruitment team
      const cc = "recruitment@theitbc.com";
      
      // When replying (threadId exists), don't send a subject
      // Gmail will use the existing thread subject
      const finalSubject = threadId ? "" : subject;
      
      // Add console log to verify email body content and threading details
      console.log("Email sending details:", {
        to,
        subject: finalSubject || "(reply - using thread subject)",
        bodyLength: body.length,
        firstChars: body.substring(0, 100),
        isReply: !!threadId,
        threadId: threadId || 'new email',
        messageId: messageId || 'none',
        candidateName,
        jobTitle
      });
      
      // Create the payload object with ALL threading information
      const payload: any = {
        to,
        cc,
        subject: finalSubject,
        body,
        candidateName,
        jobTitle,
        userId: user.id
      };
      
      // Always include threadId and messageId in the payload if they exist
      // This is critical for proper threading
      if (threadId) {
        payload.threadId = threadId.trim();
        console.log("Including threadId in request:", threadId.trim());
      }
      
      if (messageId) {
        payload.messageId = messageId.trim();
        console.log("Including messageId in request:", messageId.trim());
      }
      
      // Proactively check Gmail token before sending
      const connection = await supabase.functions.invoke('google-auth', {
        body: {
          action: 'check-token',
          userId: user.id
        }
      });
      
      if (connection.data?.expired && connection.data?.hasRefreshToken) {
        const refreshed = await refreshGmailToken();
        if (!refreshed) {
          throw new Error("Gmail token expired and could not be refreshed");
        }
      }
      
      const { data, error } = await supabase.functions.invoke('send-gmail', {
        body: payload
      });
      
      if (error) {
        console.error("Error sending email via function:", error);
        throw new Error(error.message || "Failed to send email");
      }
      
      if (data?.error) {
        console.error("Error from send-gmail function:", data.error);
        if (data.error.includes("token expired") || data.error.includes("not connected")) {
          const refreshed = await refreshGmailToken();
          if (refreshed) {
            // Try again with refreshed token
            return sendEmailViaGmail(to, subject, body, candidateName, jobTitle, threadId, messageId);
          }
        }
        
        throw new Error(data.error);
      }
      
      const result: EmailResult = {
        threadId: data?.threadId || '',
        messageId: data?.messageId || ''
      };
      
      console.log("Email sent successfully:", result);
      
      if (onSuccess) {
        onSuccess();
      }
      
      return result;
    } catch (error) {
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
    jobTitle: string = ""
  ) => {
    try {
      const cc = "recruitment@theitbc.com";
      const bodyEncoded = encodeURIComponent(body);
      const subjectEncoded = encodeURIComponent(subject);
      const toEncoded = encodeURIComponent(to);
      const ccEncoded = encodeURIComponent(cc);
      
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
