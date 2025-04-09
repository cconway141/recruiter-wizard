
import { MessageTemplate } from "@/types/messageTemplate";

interface UseEmailContentProps {
  candidateName: string;
  jobTitle?: string;
  templates: MessageTemplate[];
  selectedTemplate: string;
}

interface EmailContentReturn {
  subject: string;
  body: string;
}

export const useEmailContent = ({
  candidateName,
  jobTitle,
  templates,
  selectedTemplate
}: UseEmailContentProps) => {
  const getEmailContent = (): EmailContentReturn => {
    const subject = `ITBC ${jobTitle || ''} ${candidateName}`;
    
    let body = `Hello ${candidateName},<br><br>I hope this email finds you well.`;
    
    if (selectedTemplate && selectedTemplate !== "custom") {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        body = template.message.replace(/\[First Name\]/g, candidateName.split(' ')[0]);
      }
    }
    
    return { subject, body };
  };

  return { getEmailContent };
};
