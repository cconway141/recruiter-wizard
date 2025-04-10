
import { useState, useEffect, useCallback } from "react";
import { useMessageTemplates } from "./useMessageTemplates";
import { useAuth } from "@/contexts/AuthContext";
import { MessageTemplate } from "@/types/messageTemplate";

interface EmailContentProps {
  candidateName?: string;
  jobTitle?: string;
  selectedTemplate?: string;
  threadId?: string | null;
}

export const useEmailContent = ({
  candidateName = '',
  jobTitle = '',
  selectedTemplate = 'default'
}: EmailContentProps) => {
  const { user } = useAuth();
  const { templates, loading: templatesLoading } = useMessageTemplates();
  const [emailContent, setEmailContent] = useState<{ subject: string; body: string }>({
    subject: '',
    body: '',
  });
  
  // Function to get the content for a specific template
  const getEmailContent = useCallback((templateId?: string) => {
    const templateToUse = templateId || selectedTemplate;
    
    if (!templates || templates.length === 0) {
      return { subject: '', body: '' };
    }
    
    const template = templates.find((t) => t.id === templateId) || templates[0];
    
    if (!template) {
      return { subject: '', body: '' };
    }
    
    const candidateName_placeholder = '{candidate_name}';
    const jobTitle_placeholder = '{job_title}';
    const userSignature_placeholder = '{user_signature}';
    
    // Handle different property names in MessageTemplate type
    let subject = template.subject || template.title || '';
    let body = template.content || template.message || '';
    
    // Replace candidate name
    if (candidateName) {
      subject = subject.replace(new RegExp(candidateName_placeholder, 'g'), candidateName);
      body = body.replace(new RegExp(candidateName_placeholder, 'g'), candidateName);
    }
    
    // Replace job title
    if (jobTitle) {
      subject = subject.replace(new RegExp(jobTitle_placeholder, 'g'), jobTitle);
      body = body.replace(new RegExp(jobTitle_placeholder, 'g'), jobTitle);
    }
    
    // Add signature if the user has one
    const userSignature = ''; // This would come from user profile
    if (userSignature) {
      body = body.replace(new RegExp(userSignature_placeholder, 'g'), userSignature);
    } else {
      body = body.replace(new RegExp(userSignature_placeholder, 'g'), '');
    }
    
    return { subject, body };
  }, [candidateName, jobTitle, selectedTemplate, templates]);
  
  // Update email content when template or related data changes
  useEffect(() => {
    if (!templatesLoading && templates && templates.length > 0) {
      const content = getEmailContent(selectedTemplate);
      setEmailContent(content);
    }
  }, [templates, templatesLoading, selectedTemplate, getEmailContent]);
  
  return {
    emailContent,
    emailTemplates: templates,
    getEmailContent,
    isLoading: templatesLoading
  };
};
