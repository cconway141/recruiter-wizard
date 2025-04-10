
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useEmailSender } from "@/hooks/email/useEmailSender";
import { useCandidateThreads } from "@/hooks/email/useCandidateThreads";
import { useToast } from "@/hooks/use-toast";

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

    if (!body.trim()) {
      toast({
        title: "Email is empty",
        description: "Please enter some content before sending.",
        variant: "destructive",
      });
      return;
    }

    if (!candidateId) {
      toast({
        title: "Missing candidate information",
        description: "Cannot send email without candidate identification.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);
      setErrorMessage(null);

      console.group("EMAIL SENDING PROCESS");
      console.log("Sending email to:", candidateEmail);
      console.log("Subject:", subject);
      console.log("Candidate:", candidateName);
      console.log("Job Title:", candidateFacingTitle || "USING DEFAULT: General Position");
      console.log("Thread ID:", threadId || "NEW THREAD");
      console.log("Message ID:", messageId || "NEW MESSAGE");
      
      // Ensure we never pass undefined for job title
      const safeJobTitle = candidateFacingTitle || "General Position";

      const result = await sendEmailViaGmail(
        candidateEmail,
        subject,
        body,
        candidateName,
        safeJobTitle,
        threadId,
        messageId
      );

      console.log("Email send result:", result);

      if (result?.threadId && candidateId && jobId) {
        console.log("Saving thread and message IDs:", {
          threadId: result.threadId,
          messageId: result.messageId
        });
        
        // Get existing thread IDs
        const { data } = await supabase
          .from('candidates')
          .select('thread_ids')
          .eq('id', candidateId)
          .single();
          
        // Create a safe default empty object if there are no thread IDs
        const existingThreadIds = (data?.thread_ids || {}) as Record<string, any>;
        
        await saveThreadId({
          candidateId,
          threadIds: existingThreadIds,
          jobId,
          newThreadId: result.threadId,
          newMessageId: result.messageId
        });
        
        console.log("Thread info saved successfully");
      } else {
        console.warn("Unable to save thread info - missing required data:", {
          hasThreadId: !!result?.threadId,
          hasCandidateId: !!candidateId,
          hasJobId: !!jobId
        });
      }
      
      console.groupEnd();
    } catch (error) {
      console.error("Error sending email:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to send email");

      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      console.groupEnd();
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

    // Ensure we never pass undefined for job title
    const safeJobTitle = candidateFacingTitle || "General Position";

    composeEmailInGmail(
      candidateEmail,
      subject,
      body,
      candidateName,
      safeJobTitle,
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
