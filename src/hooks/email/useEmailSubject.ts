
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
    
    // For new threads, create a standardized format with fallbacks
    // Always use a clean candidate name
    const cleanCandidateName = candidateName.trim();
    
    // Use job title directly, don't add "General Position" fallback
    const jobTitle = candidateFacingTitle?.trim() || "";
    
    // Create standard subject format: "ITBC [Job Title] [Candidate Name]"
    const standardizedSubject = `ITBC ${jobTitle} ${cleanCandidateName}`.trim();
    
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
