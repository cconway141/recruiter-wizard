
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
    
    // Format: ITBC [Job Title] [Candidate Name]
    // Only use "General Position" if candidateFacingTitle is truly empty
    const jobTitle = candidateFacingTitle?.trim() || "General Position";
    const formattedSubject = `ITBC ${jobTitle} ${candidateName}`.trim();
    
    setSubject(formattedSubject);
  }, [candidateName, candidateFacingTitle, threadTitle]);

  return {
    subject,
    setSubject
  };
};
