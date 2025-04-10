
import { useEffect, useState } from "react";

interface UseEmailSubjectProps {
  candidateName: string;
  candidateFacingTitle?: string;
  threadTitle?: string;
}

export const useEmailSubject = ({
  candidateName,
  candidateFacingTitle,
  threadTitle,
}: UseEmailSubjectProps) => {
  const [subject, setSubject] = useState("");

  useEffect(() => {
    console.group('Subject Line Generation');
    console.log('Input Variables:', {
      candidateFacingTitle: candidateFacingTitle || 'UNDEFINED',
      candidateName: candidateName || 'UNDEFINED',
      threadTitle: threadTitle || 'UNDEFINED'
    });

    // Use threadTitle if available (for replies to existing threads)
    if (threadTitle) {
      console.log("Using existing threadTitle for reply:", threadTitle);
      setSubject(threadTitle);
      console.log('Final Subject (from thread):', threadTitle);
      console.groupEnd();
      return;
    }
    
    // For new threads, ensure we have proper formatting
    // Make sure we have a string, even if empty
    const jobTitle = candidateFacingTitle || "";
    
    // Create standard subject format: "ITBC [Job Title] [Candidate Name]"
    // Avoid having "ITBC undefined" by using empty string if job title is missing
    const standardizedSubject = `ITBC ${jobTitle} ${candidateName}`.trim();
    console.log("Created standardized subject:", standardizedSubject);
    
    setSubject(standardizedSubject);
    console.log('Final Subject (new):', standardizedSubject);
    console.groupEnd();
  }, [candidateName, candidateFacingTitle, threadTitle]);

  return {
    subject,
    setSubject
  };
};
