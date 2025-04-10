
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
    // Use threadTitle if available (for replies to existing threads)
    if (threadTitle) {
      setSubject(threadTitle);
      return;
    }
    
    // Simple subject line format: ITBC [Job Title] [Candidate Name]
    const standardizedSubject = `ITBC ${candidateFacingTitle || ""} ${candidateName}`.trim();
    
    setSubject(standardizedSubject);
  }, [candidateName, candidateFacingTitle, threadTitle]);

  return {
    subject,
    setSubject
  };
};
