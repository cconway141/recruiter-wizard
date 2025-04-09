
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash, Mail, Linkedin, ExternalLink, Loader2 } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMessageTemplates } from "@/hooks/useMessageTemplates";
import { Candidate } from "./types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CandidateListItemProps {
  candidate: Candidate;
  onRemove: (candidateId: string) => void;
  onStatusChange: (candidateId: string, statusKey: keyof Candidate['status']) => void;
}

export const CandidateListItem: React.FC<CandidateListItemProps> = ({ 
  candidate, 
  onRemove, 
  onStatusChange 
}) => {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");
  const [isSending, setIsSending] = useState(false);
  const { templates } = useMessageTemplates();
  const { toast } = useToast();

  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEmailDialogOpen(true);
  };

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
    
    try {
      const { subject, body } = getEmailContent();
      
      // Call our Supabase edge function to send the email via Gmail API
      const { data, error } = await supabase.functions.invoke('send-gmail', {
        body: {
          to: candidate.email,
          subject,
          body,
          candidateName: candidate.name
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Email Sent",
        description: `Email was successfully sent to ${candidate.name}.`,
      });
      
      // Close the dialog
      setEmailDialogOpen(false);
    } catch (error) {
      console.error("Error sending email:", error);
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
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(candidate.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open Gmail in a new tab
    window.open(gmailUrl, '_blank');
    
    // Close the dialog
    setEmailDialogOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-8 gap-2 items-center p-2 rounded hover:bg-gray-50">
        <div className="flex items-center col-span-3 gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onRemove(candidate.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <span className="font-medium truncate">{candidate.name}</span>
            <div className="flex items-center text-xs text-gray-500 space-x-2">
              {candidate.email && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        className="flex items-center text-blue-500 hover:text-blue-700"
                        onClick={handleEmailClick}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-[100px]">{candidate.email}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Send email to {candidate.email}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {candidate.linkedinUrl && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a 
                        href={candidate.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Linkedin className="h-3 w-3" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View LinkedIn Profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Checkbox 
            id={`approved-${candidate.id}`}
            checked={candidate.status.approved}
            onCheckedChange={() => 
              onStatusChange(candidate.id, "approved")
            }
          />
        </div>
        
        <div className="flex justify-center">
          <Checkbox 
            id={`preparing-${candidate.id}`}
            checked={candidate.status.preparing}
            onCheckedChange={() => 
              onStatusChange(candidate.id, "preparing")
            }
          />
        </div>
        
        <div className="flex justify-center">
          <Checkbox 
            id={`submitted-${candidate.id}`}
            checked={candidate.status.submitted}
            onCheckedChange={() => 
              onStatusChange(candidate.id, "submitted")
            }
          />
        </div>
        
        <div className="flex justify-center">
          <Checkbox 
            id={`interviewing-${candidate.id}`}
            checked={candidate.status.interviewing}
            onCheckedChange={() => 
              onStatusChange(candidate.id, "interviewing")
            }
          />
        </div>
        
        <div className="flex justify-center">
          <Checkbox 
            id={`offered-${candidate.id}`}
            checked={candidate.status.offered}
            onCheckedChange={() => 
              onStatusChange(candidate.id, "offered")
            }
          />
        </div>
      </div>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
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
    </>
  );
};
