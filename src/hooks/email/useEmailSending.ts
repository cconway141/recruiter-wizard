
import { useState } from "react";
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

    try {
      setIsSending(true);
      setErrorMessage(null);

      console.log("\n==================================================");
      console.log("🚀 INITIATING EMAIL SEND:");
      console.log("==================================================");
      console.log("Recipient:", candidateEmail);
      console.log("Subject:", subject);
      console.log("Candidate:", candidateName);
      console.log("Job Title:", candidateFacingTitle);
      console.log("Thread ID:", threadId || "NEW THREAD");
      console.log("Message ID:", messageId || "NEW MESSAGE");
      console.log("==================================================\n");

      const result = await sendEmailViaGmail(
        candidateEmail,
        subject,
        body,
        candidateName,
        candidateFacingTitle,
        threadId,
        messageId
      );

      console.log("\n==================================================");
      console.log("📨 EMAIL SENT - SAVING THREAD DATA:");
      console.log("==================================================");
      console.log("Result:", result);
      console.log("Candidate ID:", candidateId);
      console.log("Job ID:", jobId);
      console.log("==================================================\n");

      if (result?.threadId && candidateId && jobId) {
        console.log("Saving new thread and message IDs:", result);
        await saveThreadId({
          candidateId,
          threadIds: {},
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
      candidateFacingTitle,
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
