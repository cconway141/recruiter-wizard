
import React, { useEffect } from "react";
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
  // Add debug logging
  useEffect(() => {
    console.log("EmailDialogContent rendered with: ", {
      selectedTemplate,
      templateCount: emailTemplates?.length || 0,
      subject: subject?.substring(0, 20) + "...",
      bodyLength: body?.length || 0,
      threadId: threadId || 'new email'
    });
  }, [selectedTemplate, emailTemplates, subject, body, threadId]);

  return (
    <div className="space-y-4">
      {/* Template selector - ALWAYS visible */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select a template</label>
        <EmailTemplateSelector
          templates={emailTemplates || []}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={(newTemplate) => {
            console.log(`Template selected in dialog: ${newTemplate}`);
            onTemplateChange(newTemplate);
          }}
        />
        {threadId && (
          <p className="text-xs text-gray-500 mt-1">
            Note: Using a template for replies will only update the email body text
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium">
          Subject
        </label>
        <input
          id="subject"
          className="w-full border border-input rounded-md p-2"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          readOnly={!!threadId}
        />
        {threadId && (
          <p className="text-xs text-gray-500 mt-1">
            Subject cannot be changed for replies
          </p>
        )}
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
