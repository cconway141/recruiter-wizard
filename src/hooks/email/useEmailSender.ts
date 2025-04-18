import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useGmailConnection } from "@/hooks/gmail";
import { EmailResult } from "./types";

interface UseEmailSenderProps {
  onSuccess?: () => void;
}

export const useEmailSender = ({ onSuccess }: UseEmailSenderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { refreshGmailToken } = useGmailConnection();
  
  const connectionCheckedRef = useRef<boolean>(false);
  const lastConnectionCheckTimeRef = useRef<number>(0);
  const connectionStatusRef = useRef<boolean>(false);

  const sendEmailViaGmail = async (
    to: string,
    subject: string,
    body: string,
    candidateName: string,
    jobTitle: string | undefined,
    threadId: string | null,
    messageId: string | null
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
      
      const cc = "recruitment@theitbc.com";
      const finalSubject = subject;
      
      console.log("EMAIL SENDING PAYLOAD DEBUG:", {
        recipient: to,
        subject: subject || "(reply - using thread subject)",
        bodyLength: body.length,
        candidateName,
        jobTitle,
        threadId: threadId ? `THREAD: ${threadId.trim()}` : "NEW THREAD",
        messageId: messageId ? `MESSAGE: ${messageId.trim()}` : "NO MESSAGE ID",
      });
      
      const payload: any = {
        to,
        cc,
        subject: finalSubject,
        body,
        candidateName,
        jobTitle: jobTitle || '',
        userId: user.id
      };
      
      if (threadId?.trim()) {
        payload.threadId = threadId.trim();
        console.log("Including threadId in request:", threadId.trim());
      }
      
      if (messageId?.trim()) {
        payload.messageId = messageId.trim();
        console.log("Including messageId in request:", messageId.trim());
      }
      
      const now = Date.now();
      const shouldCheckToken = !connectionCheckedRef.current || 
                             (now - lastConnectionCheckTimeRef.current) > 60000; // 1 minute cache
      
      if (shouldCheckToken) {
        console.log("Checking Gmail token before sending (not cached)");
        const connection = await supabase.functions.invoke("google-auth", {
          body: {
            action: "check-connection",
            userId: user.id
          }
        });
        
        connectionCheckedRef.current = true;
        lastConnectionCheckTimeRef.current = now;
        connectionStatusRef.current = !connection.data?.expired;
        
        if (connection.data?.expired && connection.data?.hasRefreshToken) {
          console.log("Token expired, refreshing...");
          const refreshed = await refreshGmailToken();
          if (!refreshed) {
            throw new Error("Gmail token expired and could not be refreshed");
          }
          connectionStatusRef.current = true;
        }
      } else {
        console.log("Using cached Gmail token status - skipping redundant check");
      }
      
      try {
        const { data } = await supabase.functions.invoke('send-gmail', {
          body: payload
        });
        
        const result: EmailResult = {
          threadId: data?.threadId || '',
          messageId: data?.messageId || '',
          rfcMessageId: data?.rfcMessageId || ''
        };
        
        console.log("Email sent successfully:", result);
        
        if (onSuccess) {
          onSuccess();
        }
        
        return result;
      } catch (err: unknown) {
        console.error("Email sending error:", err);
        
        if (err instanceof FunctionsHttpError) {
          const status = err.context?.response?.status ?? 500;
          const json = await err.context?.response?.json().catch(() => ({}));
          
          let errorTitle = "Failed to Send Email";
          let errorDetail = "An unexpected error occurred";
          
          switch (status) {
            case 400:
              errorTitle = "Invalid Email Data";
              errorDetail = json?.details || "Please check the email details";
              break;
            case 401:
              errorTitle = "Gmail Authentication Failed";
              errorDetail = "Please reconnect your Gmail account";
              break;
            case 429:
              errorTitle = "Too Many Requests";
              errorDetail = "Please wait a moment before sending more emails";
              break;
            default:
              errorTitle = `Email Error (${status})`;
              errorDetail = json?.details || json?.error || err.message;
          }

          toast({
            title: errorTitle,
            description: errorDetail,
            variant: "destructive"
          });
        }
        throw err;
      }
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
