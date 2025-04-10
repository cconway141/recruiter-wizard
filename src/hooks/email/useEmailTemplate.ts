import { useState, useEffect } from "react";
import { useMessageTemplates } from "@/hooks/useMessageTemplates";

interface UseEmailTemplateProps {
  candidateName: string;
  jobTitle?: string;
  initialTemplate?: string;
}

export const useEmailTemplate = ({
  candidateName,
  jobTitle,
  initialTemplate = "default"
}: UseEmailTemplateProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  const [body, setBody] = useState("");

  const { templates: emailTemplates, loading: templatesLoading } = useMessageTemplates();

  // Effect to set the body content when template changes
  useEffect(() => {
    if (!templatesLoading && emailTemplates && emailTemplates.length > 0) {
      const template = emailTemplates.find(t => t.id === selectedTemplate);
      
      if (template && template.message) {
        // Apply proper replacements
        let content = template.message;
        if (candidateName) {
          content = content.replace(/\[First Name\]/g, candidateName.split(' ')[0]);
          content = content.replace(/\[Full Name\]/g, candidateName);
        }
        
        if (jobTitle) {
          content = content.replace(/\[Title\]/g, jobTitle);
          content = content.replace(/\[Job Title\]/g, jobTitle);
        }
        
        setBody(content);
        console.log(`Template selected: ${selectedTemplate}, content length: ${content.length}`);
      } else if (selectedTemplate === "custom") {
        // Keep the current body for custom templates
        console.log("Custom template selected, keeping current body");
      } else {
        console.warn(`Template ${selectedTemplate} not found or has no content`);
      }
    }
  }, [selectedTemplate, emailTemplates, templatesLoading, candidateName, jobTitle]);

  const handleTemplateChange = (template: string) => {
    console.log(`Changing template to: ${template}`);
    setSelectedTemplate(template);
  };

  return {
    body,
    setBody,
    selectedTemplate,
    emailTemplates,
    handleTemplateChange
  };
};
