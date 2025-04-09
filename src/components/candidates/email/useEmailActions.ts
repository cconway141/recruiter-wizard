
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
  const [isCheckingGmail, setIsCheckingGmail] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get thread ID for this candidate and job if it exists
  const threadId = candidate.threadIds?.[jobId || ''] || null;

  // Check connection status when component mounts
  useEffect(() => {
    if (user) {
      checkGmailConnection();
    }
  }, [user]);

  // Check if Gmail is connected
  const checkGmailConnection = async (): Promise<boolean> => {
    if (!user) {
      setErrorMessage("You must be logged in to send emails");
      return false;
    }
    
    try {
      setIsCheckingGmail(true);
      setErrorMessage(null);
      
      const { data, error } = await supabase.functions.invoke('google-auth/check-connection', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error("Error checking Gmail connection:", error);
        setErrorMessage("Failed to check Gmail connection");
        return false;
      }
      
      const isConnected = data.connected && !data.expired;
      setIsGmailConnected(isConnected);
      
      // If token is expired but we have a refresh token, refresh it
      if (data.needsRefresh) {
        const refreshResult = await refreshGmailToken();
        return refreshResult;
      }
      
      return isConnected;
    } catch (error) {
      console.error("Error checking Gmail connection:", error);
      setErrorMessage("Failed to check Gmail connection");
      return false;
    } finally {
      setIsCheckingGmail(false);
    }
  };
  
  // Refresh the Gmail access token
  const refreshGmailToken = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase.functions.invoke('google-auth/refresh-token', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error("Error refreshing Gmail token:", error);
        setErrorMessage("Failed to refresh Gmail token. Please reconnect your account.");
        return false;
      }
      
      setIsGmailConnected(true);
      return true;
    } catch (error) {
      console.error("Error refreshing Gmail token:", error);
      setErrorMessage("Failed to refresh Gmail token. Please reconnect your account.");
      return false;
    }
  };

  const getEmailContent = (): EmailContentReturn => {
    if (!candidate.email) return { subject: '', body: '' };
    
    // Always use a consistent subject format to maintain threading
    const subject = `ITBC ${jobTitle || ''} - ${candidate.name}`;
    
    // Default body
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
    if (!candidate.email || !user) return;
    
    setIsSending(true);
    setErrorMessage(null);
    
    try {
      // First check if Gmail is connected
      const isConnected = await checkGmailConnection();
      
      if (!isConnected) {
        setErrorMessage("Gmail not connected. Please connect your Gmail account to send emails.");
        return;
      }
      
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
          threadId,
          userId: user.id  // Include the user ID to get their OAuth token
        }
      });
      
      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to call email function");
      }
      
      if (data?.error) {
        console.error("Email sending error:", data.error);
        
        // Handle specific error cases
        if (data.error === "Gmail not connected") {
          setIsGmailConnected(false);
        } else if (data.error === "Gmail token expired") {
          // If token expired, try to refresh it and retry
          const refreshSucceeded = await refreshGmailToken();
          if (refreshSucceeded) {
            // Retry sending the email
            setIsSending(false);
            return sendEmailViaGmail();
          }
        }
        
        throw new Error(data.error);
      }

      // Store the thread ID for future reference if this is a new thread
      if (data?.threadId && jobId && (!threadId || data.threadId !== threadId)) {
        console.log("New thread ID created:", data.threadId);
        
        // Create the new thread_ids object
        const threadIdsUpdate = { ...(candidate.threadIds || {}), [jobId]: data.threadId };
        
        const { error: updateError } = await supabase
          .from('candidates')
          .update({
            thread_ids: threadIdsUpdate
          })
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
    isCheckingGmail,
    isGmailConnected,
    sendEmailViaGmail,
    composeEmail,
    checkGmailConnection
  };
};
