
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
    jobTitle: string = "General Position", // Provide default value
    threadId?: string | null,
    messageId?: string | null
  ) => {
    console.log("\n==================================================");
    console.log(`🔵 SENDING EMAIL TO: ${candidateName} <${to}>`);
    console.log(`🔵 SUBJECT: "${subject}"`);
    console.log(`🔵 JOB TITLE: ${jobTitle || "USING DEFAULT: General Position"}`);
    console.log(`🔵 THREAD ID: ${threadId || "NEW THREAD"}`);
    console.log(`🔵 MESSAGE ID: ${messageId || "NEW MESSAGE"}`);
    console.log("==================================================\n");
    
    if (!to || !user) {
      const error = "Missing recipient email or user not logged in";
      setErrorMessage(error);
      console.error("❌ EMAIL ERROR:", error);
      throw new Error(error);
    }
    
    if (!body.trim()) {
      const error = "Email body cannot be empty";
      setErrorMessage(error);
      console.error("❌ EMAIL ERROR:", error);
      throw new Error(error);
    }
    
    try {
      setIsSending(true);
      setErrorMessage(null);
      
      // Ensure job title is always present (double check)
      const finalJobTitle = jobTitle || "General Position";
      
      // Always CC the recruitment team
      const cc = "recruitment@theitbc.com";
      
      // Format and clean the thread ID and message ID - ensure they're valid strings
      const cleanThreadId = threadId && typeof threadId === 'string' && threadId.trim() !== "" ? 
        threadId.trim() : undefined;
        
      const cleanMessageId = messageId && typeof messageId === 'string' && messageId.trim() !== "" ? 
        messageId.trim() : undefined;
        
      console.log("📧 Email Request Parameters:");
      console.log(`- To: ${to}`);
      console.log(`- CC: ${cc}`);
      console.log(`- Subject: "${subject}"`);
      console.log(`- Thread ID: ${cleanThreadId || "New thread"}`);
      console.log(`- Message ID: ${cleanMessageId || "New message"}`);
      console.log(`- Job Title: ${finalJobTitle}`);
      console.log(`- Body length: ${body.length} characters`);
      
      const { data, error } = await supabase.functions.invoke('send-gmail', {
        body: {
          to,
          cc,
          subject,
          body,
          candidateName,
          jobTitle: finalJobTitle,
          threadId: cleanThreadId,
          messageId: cleanMessageId,
          userId: user.id
        }
      });
      
      console.log("📨 Email Edge Function Response:", data);
      
      if (error) {
        console.error("❌ Function error:", error);
        throw new Error(error.message || "Failed to send email");
      }
      
      if (data?.error) {
        console.error("❌ Email sending error:", data.error);
        
        // Handle token expiration
        if (data.error.includes("token expired") || data.error.includes("not connected")) {
          const refreshed = await refreshGmailToken();
          if (refreshed) {
            console.log("🔄 Gmail token refreshed successfully, retrying send...");
            // Try again with refreshed token
            return sendEmailViaGmail(to, subject, body, candidateName, finalJobTitle, threadId, messageId);
          }
        }
        
        throw new Error(data.error);
      }
      
      console.log("✅ Email sent successfully!");
      console.log(`- New Thread ID: ${data?.threadId}`);
      console.log(`- New Message ID: ${data?.messageId}`);
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Return both thread ID and message ID
      return {
        threadId: data?.threadId,
        messageId: data?.messageId
      };
    } catch (error) {
      console.error("❌ Error sending email:", error);
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
    jobTitle: string = "General Position", // Provide default
    threadId?: string | null
  ) => {
    try {
      const cc = "recruitment@theitbc.com";
      const bodyEncoded = encodeURIComponent(body);
      const subjectEncoded = encodeURIComponent(subject);
      const toEncoded = encodeURIComponent(to);
      const ccEncoded = encodeURIComponent(cc);
      
      // Ensure job title is never undefined
      const finalJobTitle = jobTitle || "General Position";
      
      console.log("🔗 Opening Gmail compose with:", {
        to,
        subject,
        jobTitle: finalJobTitle,
        candidateName,
        threadId: threadId || "New thread"
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
