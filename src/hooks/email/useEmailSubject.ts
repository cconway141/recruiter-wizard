
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
    
    // Use threadTitle if available (for replies to existing threads)
    if (threadTitle) {
      console.log("Using existing threadTitle for reply:", threadTitle);
      setSubject(threadTitle);
      console.groupEnd();
      return;
    }
    
    // Simplified subject generation using clean candidate name and job title
    const cleanCandidateName = candidateName.trim();
    const cleanJobTitle = candidateFacingTitle?.trim() || "";
    
    // Standard format: just use the candidate facing title
    const standardizedSubject = `ITBC ${cleanJobTitle} ${cleanCandidateName}`.trim();
    
    console.log("Created subject:", standardizedSubject);
    
    setSubject(standardizedSubject);
    console.groupEnd();
  }, [candidateName, candidateFacingTitle, threadTitle]);

  return {
    subject,
    setSubject
  };
};

