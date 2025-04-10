
import { useState, useEffect, useCallback } from "react";
import { useEmailContent } from "@/hooks/useEmailContent";
import { useGmailConnection } from "@/hooks/gmail";
import { useEmailSender } from "@/hooks/email/useEmailSender";
import { useCandidateThreads } from "@/hooks/email/useCandidateThreads";
import { useToast } from "@/hooks/use-toast";

interface UseEmailDialogStateProps {
  candidateName: string;
  candidateEmail?: string;
  jobId?: string;
  jobTitle?: string;
  candidateId?: string;
  threadId?: string | null;
  threadTitle?: string;
  onClose: () => void;
}

export const useEmailDialogState = ({
  candidateName,
  candidateEmail,
  jobId,
  jobTitle,
  candidateId,
  threadId,
  threadTitle,
  onClose,
}: UseEmailDialogStateProps) => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Use the Gmail connection hook with explicit loading UI control
  const {
    isConnected: isGmailConnected,
    connectGmail,
    checkGmailConnection,
  } = useGmailConnection({
    showLoadingUI: false, // Never block UI with loading state
  });

  // Use candidate threads hook for thread management
  const { saveThreadId } = useCandidateThreads();

  // Use email content hook for template management
  const { emailTemplates, getEmailContent } = useEmailContent({
    candidateName,
    jobTitle,
    selectedTemplate,
  });

  // Use email sender hook for sending emails
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

  // Initialize content when dialog opens
  useEffect(() => {
    // Set default subject following the standardized format
    const standardizedSubject = `ITBC ${jobTitle ? jobTitle + ' ' : ''}${candidateName}`.trim();
    setSubject(threadTitle || standardizedSubject);

    // Set default content from template
    const content = getEmailContent();
    if (content) {
      setBody(content.body || "");
    }

    // Check Gmail connection in the background
    setTimeout(() => {
      checkGmailConnection().catch((err) => {
        console.error("Background Gmail check failed:", err);
      });
    }, 100);
  }, [checkGmailConnection, candidateName, jobTitle, threadTitle, getEmailContent]);

  // Handle template change
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    const content = getEmailContent(template);
    if (content) {
      setBody(content.body || "");
    }
  };

  // Handle email sending
  const handleSendEmail = async () => {
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

      // Send the email, passing the thread ID if available
      const newThreadId = await sendEmailViaGmail(
        candidateEmail,
        subject,
        body,
        candidateName,
        jobTitle,
        threadId
      );

      // If this is a new thread and we have the candidate ID and job ID, save the thread ID
      if (newThreadId && !threadId && candidateId && jobId) {
        console.log("Saving new thread ID:", newThreadId);
        await saveThreadId({
          candidateId,
          threadIds: {},
          jobId,
          newThreadId
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

  // Handle composing in Gmail
  const handleComposeInGmail = useCallback(() => {
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
      jobTitle,
      threadId
    );

    onClose();
  }, [candidateEmail, subject, body, candidateName, jobTitle, threadId, composeEmailInGmail, onClose, toast]);

  // Handle opening thread in Gmail
  const handleOpenThreadInGmail = useCallback(() => {
    const searchQuery = encodeURIComponent(`subject:(${subject})`);
    window.open(`https://mail.google.com/mail/u/0/#search/${searchQuery}`, "_blank");
  }, [subject]);

  return {
    // State
    subject,
    body,
    selectedTemplate,
    emailTemplates,
    isSending,
    errorMessage,
    isGmailConnected,
    
    // Actions
    setSubject,
    setBody,
    handleTemplateChange,
    handleSendEmail,
    handleComposeInGmail,
    handleOpenThreadInGmail,
    connectGmail,
  };
};
