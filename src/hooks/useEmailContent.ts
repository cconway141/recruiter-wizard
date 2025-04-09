
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
    
    // Start with a default greeting and signature
    let body = `Hello ${candidateName},<br><br>I hope this email finds you well.`;
    
    // If a template is selected, use its content
    if (selectedTemplate && selectedTemplate !== "custom") {
      console.log("Selected template ID:", selectedTemplate);
      console.log("Available templates:", templates.map(t => t.id).join(", "));
      
      const template = templates.find(t => t.id === selectedTemplate);
      console.log("Found template:", template ? `${template.id} - ${template.situation}` : "None");
      
      if (template && template.message) {
        // Replace template placeholders with actual values
        body = template.message
          .replace(/\[First Name\]/g, candidateName.split(' ')[0])
          .replace(/\[Full Name\]/g, candidateName);
        
        console.log("Template body after replacement:", body.substring(0, 100) + "...");
        
        // Ensure proper HTML formatting for email
        if (!body.includes('<br>') && !body.includes('<p>')) {
          // Convert newlines to <br> tags for HTML formatting
          body = body.replace(/\n/g, '<br>');
          console.log("Added HTML line breaks");
        }
      } else {
        console.log("Warning: Selected template not found or has no message content");
      }
    } else {
      console.log("Using custom template (no specific template selected)");
    }
    
    // Ensure body is not empty and has a signature
    if (!body || body.trim() === '') {
      console.log("Body was empty, using default content");
      body = `Hello ${candidateName},<br><br>I hope this email finds you well.<br><br>Best regards,<br>The ITBC Team`;
    } else if (!body.includes('Best regards') && !body.includes('Regards')) {
      // Add signature if not already present
      console.log("Adding signature to email");
      body += `<br><br>Best regards,<br>The ITBC Team`;
    }
    
    console.log("Email content generated:", { subject, bodyLength: body.length });
    console.log("Email body preview:", body.substring(0, 100) + "...");
    
    return { subject, body };
  };

  return { getEmailContent };
};
