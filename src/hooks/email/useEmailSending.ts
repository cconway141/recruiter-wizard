
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useEmailSender } from "@/hooks/email/useEmailSender";
import { useCandidateThreads } from "@/hooks/email/useCandidateThreads";
import { useToast } from "@/hooks/use-toast";
import { EmailThreadInfo } from "@/components/candidates/types";
import { EmailResult } from "@/hooks/email/types";

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
  threadId: initialThreadId,
  messageId: initialMessageId,
  onClose,
}: UseEmailSendingProps) => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null | undefined>(initialThreadId);
  const [currentMessageId, setCurrentMessageId] = useState<string | null | undefined>(initialMessageId);

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
      
      console.log("Email threading details:", {
        candidateId,
        jobId,
        candidateEmail,
        subject,
        isNewThread: !currentThreadId,
        threadId: currentThreadId || "New thread",
        messageId: currentMessageId || "Not available"
      });

      const result = await sendEmailViaGmail(
        candidateEmail,
        subject,
        body,
        candidateName,
        candidateFacingTitle || "",
        currentThreadId?.trim() || undefined,
        currentMessageId?.trim() || undefined
      );

      if (result?.threadId && result?.rfcMessageId && candidateId && jobId) {
        console.log("Email sent successfully, saving thread info:", {
          threadId: result.threadId, 
          rfcMessageId: result.rfcMessageId
        });
        
        const { data } = await supabase
          .from('candidates')
          .select('thread_ids')
          .eq('id', candidateId)
          .maybeSingle();
          
        const existingThreadIds = (data?.thread_ids || {}) as Record<string, any>;
        
        await saveThreadId({
          candidateId,
          threadIds: existingThreadIds,
          jobId,
          newThreadId: result.threadId,
          newMessageId: result.rfcMessageId
        });

        setCurrentThreadId(result.threadId);
        setCurrentMessageId(result.rfcMessageId);
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
      candidateFacingTitle || ""
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
