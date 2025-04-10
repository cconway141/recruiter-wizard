
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEmailSender } from "@/hooks/email/useEmailSender";
import { useGmailConnection } from "@/hooks/gmail";
import { useEmailContent } from "@/hooks/useEmailContent";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ExternalLink, Search } from "lucide-react";
import { EmailTemplateSelector } from "./EmailTemplateSelector";
import { ConfigErrorButton } from "./ConfigErrorButton";

interface EmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  candidateEmail?: string;
  jobId?: string;
  jobTitle?: string;
  candidateId?: string;
  threadId?: string | null;
  threadTitle?: string;
}

export function EmailDialog({
  isOpen,
  onClose,
  candidateName,
  candidateEmail,
  jobId,
  jobTitle,
  candidateId,
  threadId,
  threadTitle,
}: EmailDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { 
    isConnected: isGmailConnected,
    checkGmailConnection,
    connectGmail
  } = useGmailConnection({ 
    onConnectionChange: (connected) => {
      console.log("Gmail connection status changed:", connected);
    }
  });
  
  const { emailTemplates, getEmailContent } = useEmailContent({
    candidateName,
    jobTitle,
    selectedTemplate
  });
  
  const { sendEmailViaGmail, composeEmailInGmail } = useEmailSender({
    onSuccess: () => {
      setTimeout(() => {
        onClose();
        toast({
          title: "Email sent",
          description: "Your email has been sent successfully.",
        });
      }, 500);
    }
  });

  // Check Gmail connection when dialog opens
  useEffect(() => {
    if (isOpen && user) {
      checkGmailConnection();
      
      // Set default subject based on job title
      const defaultSubject = `${jobTitle ? `ITBC ${jobTitle} - ` : ''}${candidateName}`;
      setSubject(threadTitle || defaultSubject);
      
      // Set default content
      const content = getEmailContent();
      if (content) {
        setBody(content.body || '');
      }
    }
  }, [isOpen, checkGmailConnection, user, candidateName, jobTitle, threadTitle, getEmailContent]);

  // Handle email sending
  const handleSendEmail = async () => {
    if (!candidateEmail) {
      toast({
        title: "Missing email address",
        description: "No email address provided for this candidate.",
        variant: "destructive"
      });
      return;
    }
    
    if (!body.trim()) {
      toast({
        title: "Email is empty",
        description: "Please enter some content before sending.",
        variant: "destructive"
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
      console.error('Error sending email:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send email');
      
      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleComposeInGmail = () => {
    if (!candidateEmail) {
      toast({
        title: "Missing email address",
        description: "No email address provided for this candidate.",
        variant: "destructive"
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

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    const content = getEmailContent(template);
    if (content) {
      setBody(content.body || '');
    }
  };

  const openThreadInGmail = () => {
    const searchQuery = encodeURIComponent(`subject:(${subject})`);
    window.open(`https://mail.google.com/mail/u/0/#search/${searchQuery}`, '_blank');
  };

  // Handle content changes
  const handleContentChange = (content: string) => {
    setBody(content);
  };

  // Handle subject changes
  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Email to {candidateName}</DialogTitle>
          <DialogDescription>
            {candidateEmail ? (
              <>Send an email to {candidateEmail}</>
            ) : (
              <span className="text-red-500">No email address available</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-3">
            {errorMessage}
          </div>
        )}

        {!isGmailConnected && (
          <div className="bg-amber-100 border border-amber-300 rounded-md p-3 mb-4">
            <p className="text-amber-800 font-medium mb-2">Gmail connection required</p>
            <p className="text-amber-700 text-sm mb-3">
              You need to connect your Gmail account to send emails.
            </p>
            <div className="flex justify-end">
              <ConfigErrorButton
                isConnected={false}
                onClick={connectGmail}
                className="mt-2"
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          {!threadId && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select a template</label>
              <EmailTemplateSelector
                templates={emailTemplates || []}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={handleTemplateChange}
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Subject
            </label>
            <input
              id="subject"
              className="w-full border border-input rounded-md p-2"
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email-body" className="text-sm font-medium">
              Email Content
            </label>
            <textarea
              id="email-body"
              className="w-full min-h-[200px] border border-input rounded-md p-2"
              value={body}
              onChange={(e) => handleContentChange(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 flex-wrap sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openThreadInGmail}
              disabled={!isGmailConnected}
              type="button"
            >
              <Search className="h-4 w-4 mr-2" />
              View in Gmail
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleComposeInGmail}
              disabled={!isGmailConnected || !candidateEmail}
              type="button"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Gmail
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendEmail}
              disabled={!isGmailConnected || !candidateEmail || isSending}
            >
              {isSending ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
