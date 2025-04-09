
import React from "react";

interface EmailContentProps {
  selectedTemplate: string;
  templates: any[];
  candidateName: string;
  job?: { candidateFacingTitle: string } | undefined;
  candidateEmail?: string | null;
  threadTitle?: string;
}

export const EmailContent: React.FC<EmailContentProps> = ({ 
  selectedTemplate, 
  templates,
  candidateName,
  job,
  candidateEmail,
  threadTitle
}) => {
  if (!candidateEmail) {
    return (
      <div className="py-4 text-red-500">
        This candidate doesn't have an email address.
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <div>
        <p className="mb-2"><strong>To:</strong> {candidateName} ({candidateEmail})</p>
        {job && <p className="mb-2 text-sm text-gray-600"><strong>Job:</strong> {job.candidateFacingTitle}</p>}
        {threadTitle && <p className="mb-2 text-sm text-gray-600"><strong>Subject:</strong> {threadTitle}</p>}
      </div>
      
      {selectedTemplate && selectedTemplate !== "custom" && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md max-h-[200px] overflow-y-auto">
          <p className="whitespace-pre-line text-sm">
            {templates
              .find(t => t.id === selectedTemplate)?.message
              .replace(/\[First Name\]/g, candidateName.split(' ')[0]) || ''}
          </p>
        </div>
      )}
    </div>
  );
};
