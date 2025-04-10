
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
    console.log(`Getting email content for template: ${templateToUse}`);
    
    if (!templates || templates.length === 0) {
      console.warn("No templates available");
      return { subject: '', body: '' };
    }
    
    // Find the requested template or fall back to the first one
    const template = templates.find((t) => t.id === templateToUse);
    
    if (!template) {
      console.warn(`Template ${templateToUse} not found, using first available`);
      return { subject: '', body: '' };
    }
    
    console.log(`Using template: ${template.id} - ${template.situation}`);
    
    const candidateName_placeholder = '{candidate_name}';
    const firstName_placeholder = '[First Name]';
    const fullName_placeholder = '[Full Name]';
    const jobTitle_placeholder = '{job_title}';
    const jobTitle_placeholder2 = '[Title]';
    const jobTitle_placeholder3 = '[Job Title]';
    const userSignature_placeholder = '{user_signature}';
    
    // Use the correct property names from MessageTemplate
    let subject = template.situation || ''; 
    let body = template.message || '';
    
    // Replace candidate name variations
    if (candidateName) {
      const firstName = candidateName.split(' ')[0];
      subject = subject.replace(new RegExp(candidateName_placeholder, 'g'), candidateName);
      subject = subject.replace(new RegExp(firstName_placeholder, 'g'), firstName);
      subject = subject.replace(new RegExp(fullName_placeholder, 'g'), candidateName);
      
      body = body.replace(new RegExp(candidateName_placeholder, 'g'), candidateName);
      body = body.replace(new RegExp(firstName_placeholder, 'g'), firstName);
      body = body.replace(new RegExp(fullName_placeholder, 'g'), candidateName);
    }
    
    // Replace job title variations
    if (jobTitle) {
      subject = subject.replace(new RegExp(jobTitle_placeholder, 'g'), jobTitle);
      subject = subject.replace(new RegExp(jobTitle_placeholder2, 'g'), jobTitle);
      subject = subject.replace(new RegExp(jobTitle_placeholder3, 'g'), jobTitle);
      
      body = body.replace(new RegExp(jobTitle_placeholder, 'g'), jobTitle);
      body = body.replace(new RegExp(jobTitle_placeholder2, 'g'), jobTitle);
      body = body.replace(new RegExp(jobTitle_placeholder3, 'g'), jobTitle);
    }
    
    // Add signature if the user has one
    const userSignature = ''; // This would come from user profile
    if (userSignature) {
      body = body.replace(new RegExp(userSignature_placeholder, 'g'), userSignature);
    } else {
      body = body.replace(new RegExp(userSignature_placeholder, 'g'), '');
    }
    
    console.log(`Template content prepared: Subject (${subject.length} chars), Body (${body.length} chars)`);
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
