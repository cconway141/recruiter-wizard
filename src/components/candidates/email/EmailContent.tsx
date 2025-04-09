
import React from "react";

interface EmailContentProps {
  selectedTemplate: string;
  templates: any[];
  candidateName: string;
  job?: { candidateFacingTitle: string } | undefined;
  candidateEmail?: string | null;
  threadTitle?: string;
  threadId?: string | null;
}

export const EmailContent: React.FC<EmailContentProps> = ({ 
  selectedTemplate, 
  templates,
  candidateName,
  job,
  candidateEmail,
  threadTitle,
  threadId
}) => {
  if (!candidateEmail) {
    return (
      <div className="py-4 text-red-500">
        This candidate doesn't have an email address.
      </div>
    );
  }

  // Get the template content for preview
  const getTemplateContent = () => {
    if (selectedTemplate && selectedTemplate !== "custom") {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template && template.message) {
        let content = template.message
          .replace(/\[First Name\]/g, candidateName.split(' ')[0])
          .replace(/\[Full Name\]/g, candidateName);
        
        return content;
      }
    }
    return '';
  };

  const templateContent = getTemplateContent();

  return (
    <div className="space-y-4 py-4">
      <div>
        <p className="mb-2"><strong>To:</strong> {candidateName} ({candidateEmail})</p>
        {job && <p className="mb-2 text-sm text-gray-600"><strong>Job:</strong> {job.candidateFacingTitle}</p>}
        {threadTitle && <p className="mb-2 text-sm text-gray-600"><strong>Subject:</strong> {threadTitle}</p>}
        {threadId && <p className="mb-2 text-xs text-gray-500"><strong>Thread ID:</strong> {threadId}</p>}
      </div>
      
      {selectedTemplate && selectedTemplate !== "custom" && templateContent && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md max-h-[200px] overflow-y-auto">
          <p className="whitespace-pre-line text-sm">
            {templateContent}
          </p>
        </div>
      )}

      {(!templateContent && selectedTemplate !== "custom") && (
        <div className="mt-2 p-3 bg-red-50 rounded-md">
          <p className="text-sm text-red-500">
            Warning: Selected template appears to be empty. Please choose another template.
          </p>
        </div>
      )}
      
      {selectedTemplate === "custom" && (
        <div className="mt-2 p-3 bg-blue-50 rounded-md">
          <p className="text-sm">
            A standard greeting and signature will be added to your email.
          </p>
        </div>
      )}
    </div>
  );
};
