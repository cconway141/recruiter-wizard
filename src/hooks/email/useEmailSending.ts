
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useEmailSender } from "@/hooks/email/useEmailSender";
import { useCandidateThreads } from "@/hooks/email/useCandidateThreads";
import { useToast } from "@/hooks/use-toast";
import { EmailThreadInfo } from "@/components/candidates/types";

interface UseEmailSendingProps {
  candidateId?: string;
  candidateName: string;
  candidateEmail?: string;
  jobId?: string;
  candidateFacingTitle?: string;
  threadId?: string | null;
  messageId?: string | null;
  onClose: () => void;
}

export const useEmailSending = ({
  candidateId,
  candidateName,
  candidateEmail,
  jobId,
  candidateFacingTitle,
  threadId,
  messageId,
  onClose,
}: UseEmailSendingProps) => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { saveThreadId } = useCandidateThreads();

  const { sendEmailViaGmail, composeEmailInGmail } = useEmailSender({
    onSuccess: () => {
      setTimeout(() => {
        onClose();
        toast({
          title: "Email sent",
          description: "Your email has been sent successfully.",
        });
      }, 500);
    },
  });

  const handleSendEmail = async (subject: string, body: string) => {
    if (!candidateEmail) {
      toast({
        title: "Missing email address",
        description: "No email address provided for this candidate.",
        variant: "destructive",
      });
      return;
    }

    if (!body?.trim()) {
      toast({
        title: "Email is empty",
        description: "Please enter some content before sending.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);
      setErrorMessage(null);
      
      // Determine if this is a new thread
      const isNewThread = !threadId;
      
      console.log("Email threading details:", {
        candidateId,
        jobId,
        candidateEmail,
        subject,
        isNewThread,
        threadId: threadId || "New thread",
        messageId: messageId || "Not available"
      });

      // For replies, don't pass subject - Gmail will use the thread's subject
      const emailSubject = isNewThread ? subject : "";
      
      // Always pass threadId and messageId when available - critical for threading
      const result = await sendEmailViaGmail(
        candidateEmail,
        emailSubject,
        body,
        candidateName,
        candidateFacingTitle || "",
        threadId,
        messageId
      );

      if (result?.threadId && candidateId && jobId) {
        console.log("Email sent successfully, saving thread info:", {
          threadId: result.threadId, 
          messageId: result.messageId
        });
        
        // Get existing thread IDs
        const { data } = await supabase
          .from('candidates')
          .select('thread_ids')
          .eq('id', candidateId)
          .maybeSingle();
          
        // Create a safe default empty object if there are no thread IDs
        const existingThreadIds = (data?.thread_ids || {}) as Record<string, any>;
        
        await saveThreadId({
          candidateId,
          threadIds: existingThreadIds,
          jobId,
          newThreadId: result.threadId,
          newMessageId: result.messageId
        });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to send email");

      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleComposeInGmail = (subject: string, body: string) => {
    if (!candidateEmail) {
      toast({
        title: "Missing email address",
        description: "No email address provided for this candidate.",
        variant: "destructive",
      });
      return;
    }

    composeEmailInGmail(
      candidateEmail,
      subject,
      body,
      candidateName,
      candidateFacingTitle || "",
      threadId
    );

    onClose();
  };

  return {
    isSending,
    errorMessage,
    handleSendEmail,
    handleComposeInGmail
  };
};
