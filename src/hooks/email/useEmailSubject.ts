
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

    if (!candidateFacingTitle) {
      console.error("ERROR: Job title (candidateFacingTitle) is missing! This should never happen.");
    }
    
    const standardizedSubject = `ITBC ${candidateFacingTitle} ${candidateName}`.trim();
    console.log("Created standardized subject:", standardizedSubject);
    
    const finalSubject = threadTitle || standardizedSubject;
    
    console.log('Final Subject:', finalSubject);
    console.log('Thread Title Used:', !!threadTitle);
    console.groupEnd();
    
    setSubject(finalSubject);
  }, [candidateName, candidateFacingTitle, threadTitle]);

  return {
    subject,
    setSubject
  };
};
