
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
    // Ensure we have a consistent subject format for proper threading
    const subject = `ITBC ${jobTitle || ''} - ${candidateName}`;
    
    // Start with a default greeting
    let body = `Hello ${candidateName},<br><br>I hope this email finds you well.`;
    
    // If a template is selected, use its content
    if (selectedTemplate && selectedTemplate !== "custom") {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template && template.message) {
        // Replace template placeholders with actual values
        body = template.message
          .replace(/\[First Name\]/g, candidateName.split(' ')[0])
          .replace(/\[Full Name\]/g, candidateName);
        
        // Ensure proper HTML formatting for email
        if (!body.includes('<br>') && !body.includes('<p>')) {
          // Convert newlines to <br> tags for HTML formatting
          body = body.replace(/\n/g, '<br>');
        }
      }
    }
    
    // Ensure body is not empty
    if (!body || body.trim() === '') {
      body = `Hello ${candidateName},<br><br>I hope this email finds you well.<br><br>Best regards,<br>The ITBC Team`;
    }
    
    return { subject, body };
  };

  return { getEmailContent };
};
