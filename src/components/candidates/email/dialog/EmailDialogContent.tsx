
import React from "react";
import { EmailTemplateSelector } from "../EmailTemplateSelector";

interface EmailDialogContentProps {
  threadId?: string | null;
  subject: string;
  body: string;
  selectedTemplate: string;
  emailTemplates: Array<any>;
  onTemplateChange: (template: string) => void;
  onSubjectChange: (subject: string) => void;
  onBodyChange: (body: string) => void;
}

export const EmailDialogContent: React.FC<EmailDialogContentProps> = ({
  threadId,
  subject,
  body,
  selectedTemplate,
  emailTemplates,
  onTemplateChange,
  onSubjectChange,
  onBodyChange,
}) => {
  return (
    <div className="space-y-4">
      {!threadId && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Select a template</label>
          <EmailTemplateSelector
            templates={emailTemplates || []}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={onTemplateChange}
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
          onChange={(e) => onSubjectChange(e.target.value)}
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
          onChange={(e) => onBodyChange(e.target.value)}
        />
      </div>
    </div>
  );
};
