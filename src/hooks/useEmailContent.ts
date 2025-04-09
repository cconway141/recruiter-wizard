
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UseEmailContentProps {
  candidateName: string;
  jobTitle?: string;
  templates: any[];
  selectedTemplate: string;
}

export const useEmailContent = ({ candidateName, jobTitle, templates, selectedTemplate }: UseEmailContentProps) => {
  const [emailBody, setEmailBody] = useState('');
  const [emailSignature, setEmailSignature] = useState('');
  const { user } = useAuth();
  
  // Fetch the user's email signature from the profiles table
  useEffect(() => {
    const fetchSignature = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('email_signature')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          setEmailSignature(data.email_signature || '');
        }
      }
    };
    
    fetchSignature();
  }, [user]);

  // Generate the email content based on the selected template and candidate info
  useEffect(() => {
    console.log("Generating email content:", { selectedTemplate, templates });
    
    if (!templates || templates.length === 0) {
      console.log("No templates available");
      return;
    }

    let content = '';
    const firstName = candidateName.split(' ')[0];

    // Get template content
    if (selectedTemplate === 'custom') {
      // For custom templates, use a generic greeting
      content = `Hi ${firstName},\n\nI hope this email finds you well.\n\n`;
    } else {
      // Find the template
      const template = templates.find(t => t.id === selectedTemplate);
      
      if (template && template.message) {
        console.log("Found template:", template.id);
        
        // Replace placeholders
        content = template.message
          .replace(/\[First Name\]/g, firstName)
          .replace(/\[Full Name\]/g, candidateName);
          
        // Replace job title if provided
        if (jobTitle) {
          content = content.replace(/\[Job Title\]/g, jobTitle);
        }
      } else {
        console.log("Template not found, using default greeting");
        content = `Hi ${firstName},\n\nI hope this email finds you well.\n\n`;
      }
    }
    
    // Format content for HTML
    const formattedContent = content
      .replace(/\n/g, '<br>')
      .replace(/\[Job Title\]/g, jobTitle || '[Job Title]');
    
    // Ensure there's a signature separator if a signature exists
    const signature = emailSignature 
      ? `<br><br>--<br>${emailSignature.replace(/\n/g, '<br>')}` 
      : '';
    
    const htmlContent = `<div>${formattedContent}${signature}</div>`;
    console.log("Generated HTML content:", htmlContent);
    
    setEmailBody(htmlContent);
  }, [selectedTemplate, templates, candidateName, jobTitle, emailSignature]);

  const getEmailContent = () => {
    console.log("Returning email content:", { body: emailBody });
    return {
      body: emailBody,
    };
  };

  return {
    getEmailContent,
  };
};
