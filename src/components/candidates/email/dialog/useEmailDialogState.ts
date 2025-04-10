
import { useState, useEffect } from "react";
import { useEmailContent } from "@/hooks/useEmailContent";
import { useGmailConnection } from "@/hooks/gmail";
import { useEmailSender } from "@/hooks/email/useEmailSender";
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
    // Set default subject based on job title or thread title
    const defaultSubject = threadTitle || 
      `${jobTitle ? `ITBC ${jobTitle} - ` : ''}${candidateName}`;
    setSubject(defaultSubject);

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

      await sendEmailViaGmail(
        candidateEmail,
        subject,
        body,
        candidateName,
        jobTitle,
        threadId
      );
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
  const handleComposeInGmail = () => {
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
  };

  // Handle opening thread in Gmail
  const handleOpenThreadInGmail = () => {
    const searchQuery = encodeURIComponent(`subject:(${subject})`);
    window.open(`https://mail.google.com/mail/u/0/#search/${searchQuery}`, "_blank");
  };

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
