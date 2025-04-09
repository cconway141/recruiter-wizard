
import React, { useState } from "react";
import { AlertCircle, ExternalLink, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMessageTemplates } from "@/hooks/useMessageTemplates";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: {
    id: string;
    name: string;
    email: string | null;
  };
}

export const EmailDialog: React.FC<EmailDialogProps> = ({ 
  open, 
  onOpenChange, 
  candidate 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { templates } = useMessageTemplates();
  const { toast } = useToast();

  const getEmailContent = () => {
    if (!candidate.email) return { subject: '', body: '' };
    
    // Default subject and body
    let subject = `Regarding your application`;
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
    if (!candidate.email) return;
    
    setIsSending(true);
    setErrorMessage(null);
    
    try {
      const { subject, body } = getEmailContent();
      
      console.log("Sending email to:", candidate.email);
      console.log("Subject:", subject);
      
      // Call our Supabase edge function to send the email via Gmail API
      const { data, error } = await supabase.functions.invoke('send-gmail', {
        body: {
          to: candidate.email,
          subject,
          body,
          candidateName: candidate.name
        }
      });
      
      console.log("Email function response:", data);
      
      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to call email function");
      }
      
      if (data?.error) {
        console.error("Email sending error:", data.error);
        throw new Error(data.error);
      }
      
      toast({
        title: "Email Sent",
        description: `Email was successfully sent to ${candidate.name}.`,
      });
      
      // Close the dialog
      onOpenChange(false);
    } catch (error) {
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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email {candidate.name}</DialogTitle>
          <DialogDescription>
            Select a template or compose a custom email to this candidate.
          </DialogDescription>
        </DialogHeader>
        
        {candidate.email ? (
          <div className="space-y-4 py-4">
            <div>
              <p className="mb-2"><strong>To:</strong> {candidate.name} ({candidate.email})</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="template-select" className="block text-sm font-medium text-gray-700">
                Email Template
              </label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger id="template-select" className="w-full">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Email</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.category} - {template.situation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedTemplate && selectedTemplate !== "custom" && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md max-h-[200px] overflow-y-auto">
                  <p className="whitespace-pre-line text-sm">
                    {templates
                      .find(t => t.id === selectedTemplate)?.message
                      .replace(/\[First Name\]/g, candidate.name.split(' ')[0]) || ''}
                  </p>
                </div>
              )}
            </div>
            
            {errorMessage && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="py-4 text-red-500">
            This candidate doesn't have an email address.
          </div>
        )}
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          
          {candidate.email && (
            <>
              <Button 
                onClick={composeEmail}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Mail className="h-4 w-4" />
                <span>Compose in Gmail</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
              
              <Button 
                onClick={sendEmailViaGmail}
                className="flex items-center gap-2"
                disabled={isSending}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                <span>Send Email Now</span>
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
