
import { useState, useEffect } from "react";
import { useEmailContent } from "@/hooks/useEmailContent";

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

  const { emailTemplates, getEmailContent } = useEmailContent({
    candidateName,
    jobTitle,
    selectedTemplate,
  });

  useEffect(() => {
    const content = getEmailContent();
    if (content) {
      setBody(content.body || "");
    }
  }, [getEmailContent, selectedTemplate]);

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    const content = getEmailContent(template);
    if (content) {
      setBody(content.body || "");
    }
  };

  return {
    body,
    setBody,
    selectedTemplate,
    emailTemplates,
    handleTemplateChange
  };
};
