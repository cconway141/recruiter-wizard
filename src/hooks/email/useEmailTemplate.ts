import { useState, useEffect, useRef } from "react";
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
  const processedTemplate = useRef<string | null>(null);
  const previousTemplate = useRef<string | null>(null);

  const { templates: emailTemplates, loading: templatesLoading } = useMessageTemplates();

  // Helper function to apply replacements consistently
  const applyReplacements = (content: string) => {
    if (!content) return "";
    
    let processed = content;
    
    // Apply proper replacements for candidate name
    if (candidateName) {
      const firstName = candidateName.split(' ')[0] || candidateName;
      processed = processed.replace(/\[First Name\]/g, firstName);
      processed = processed.replace(/\[Full Name\]/g, candidateName);
    }
    
    // Apply proper replacements for job title
    if (jobTitle) {
      processed = processed.replace(/\[Title\]/g, jobTitle);
      processed = processed.replace(/\[Job Title\]/g, jobTitle);
    } else {
      // Replace with empty string if job title is missing
      processed = processed.replace(/\[Title\]/g, "");
      processed = processed.replace(/\[Job Title\]/g, "");
    }
    
    return processed;
  };

  // Effect to set the body content when template changes
  useEffect(() => {
    // Skip if templates are still loading or if we don't have any templates
    if (templatesLoading || !emailTemplates || emailTemplates.length === 0) {
      return;
    }
    
    // Skip if the template hasn't changed since last time
    if (previousTemplate.current === selectedTemplate && processedTemplate.current === selectedTemplate) {
      return;
    }
    
    console.log(`Processing template change from ${previousTemplate.current} to ${selectedTemplate}`);
    previousTemplate.current = selectedTemplate;
    
    // Handle the case when "custom" template is selected
    if (selectedTemplate === "custom") {
      // Keep the current body for custom templates
      console.log("Custom template selected, keeping current body");
      processedTemplate.current = selectedTemplate;
      return;
    }
    
    // Find the selected template by id
    const template = emailTemplates.find(t => t.id === selectedTemplate);
    
    if (template && template.message) {
      // Apply proper replacements
      const content = applyReplacements(template.message);
      
      // Update the body with the processed content
      setBody(content);
      processedTemplate.current = selectedTemplate;
      
      console.log(`Template applied: ${selectedTemplate}, content length: ${content.length}`);
    } else {
      console.warn(`Template ${selectedTemplate} not found or has no content`);
      
      // If the selected template doesn't exist, try using the default template
      if (selectedTemplate !== "default" && selectedTemplate !== "custom") {
        const defaultTemplate = emailTemplates.find(t => t.id === "default");
        if (defaultTemplate && defaultTemplate.message) {
          const content = applyReplacements(defaultTemplate.message);
          setBody(content);
          processedTemplate.current = "default";
          console.log(`Falling back to default template, content length: ${content.length}`);
        }
      }
    }
  }, [selectedTemplate, emailTemplates, templatesLoading, candidateName, jobTitle]);

  const handleTemplateChange = (template: string) => {
    console.log(`Changing template to: ${template}`);
    setSelectedTemplate(template);
    
    // Clear the processed template ref to force reprocessing
    processedTemplate.current = null;
  };

  return {
    body,
    setBody,
    selectedTemplate,
    emailTemplates,
    handleTemplateChange
  };
};
