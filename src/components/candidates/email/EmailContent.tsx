
import React from "react";
import { useEmailContent } from "@/hooks/useEmailContent";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageTemplate } from "@/types/messageTemplate";

interface EmailContentProps {
  selectedTemplate: string;
  candidateName: string;
  job?: {
    candidateFacingTitle: string;
  } | undefined;
  candidateEmail?: string | null;
  threadTitle?: string;
  threadId?: string | null;
}

export const EmailContent: React.FC<EmailContentProps> = ({
  selectedTemplate,
  candidateName,
  job,
  candidateEmail,
  threadTitle,
  threadId
}) => {
  if (!candidateEmail) {
    return <div className="py-4 text-red-500">
        This candidate doesn't have an email address.
      </div>;
  }

  // Generate the actual email content that will be sent
  const {
    getEmailContent,
    emailTemplates
  } = useEmailContent({
    candidateName,
    jobTitle: job?.candidateFacingTitle,
    selectedTemplate
  });
  const emailContent = getEmailContent();

  // Get just the template content for preview
  const getTemplateContent = () => {
    if (selectedTemplate && selectedTemplate !== "custom" && emailTemplates) {
      const template = emailTemplates.find(t => t.id === selectedTemplate);
      if (template && (template.message || template.content)) {
        let content = (template.message || template.content || '').replace(/\[First Name\]/g, candidateName.split(' ')[0]).replace(/\[Full Name\]/g, candidateName);
        return content;
      }
    }
    return '';
  };
  const templateContent = getTemplateContent();
  
  return <div className="space-y-4 py-4">
      <div>
        <p className="mb-2"><strong>To:</strong> {candidateName} ({candidateEmail})</p>
        {job && <p className="mb-2 text-sm text-gray-600">
          <strong>Job:</strong> {job.candidateFacingTitle}
        </p>}
        <p className="mb-2 text-sm text-gray-600">
          <strong>Subject:</strong> {`ITBC ${job?.candidateFacingTitle || ''} ${candidateName}`.trim()}
        </p>
        {threadId && <p className="mb-2 text-xs text-gray-500"><strong>Thread ID:</strong> {threadId}</p>}
      </div>
      
      {selectedTemplate && selectedTemplate !== "custom" && templateContent && <div className="mt-2 p-3 bg-gray-50 rounded-md max-h-[200px] overflow-y-auto">
          <p className="whitespace-pre-line text-sm">
            {templateContent}
          </p>
        </div>}

      {!templateContent && selectedTemplate !== "custom" && <div className="mt-2 p-3 bg-red-50 rounded-md">
          <p className="text-sm text-red-500">
            Warning: Selected template appears to be empty. Please choose another template.
          </p>
        </div>}
      
      {selectedTemplate === "custom" && <div className="mt-2 p-3 bg-gray-100 rounded-md">
          <p className="text-sm">
            Custom message for {candidateName}
          </p>
        </div>}
      
      {/* Show actual email preview with full greeting and signature */}
      {emailContent.body && <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <h4 className="font-medium text-sm mb-1">Complete Email Preview:</h4>
          <div className="max-h-[180px] overflow-y-auto bg-white p-2 rounded border text-sm">
            <div dangerouslySetInnerHTML={{
          __html: emailContent.body
        }} />
          </div>
        </div>}
    </div>;
};
