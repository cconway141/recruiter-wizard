import { useCallback, useEffect, useState } from "react";
import { useCandidateThreads } from "@/hooks/email/useCandidateThreads";

interface UseGmailThreadProps {
  candidateId?: string;
  jobId?: string;
  threadId?: string | null;
}

export const useGmailThread = ({
  candidateId,
  jobId,
  threadId
}: UseGmailThreadProps) => {
  const [messageId, setMessageId] = useState<string | null>(null);
  const { getMessageId, getThreadInfo } = useCandidateThreads();
  
  useEffect(() => {
    const fetchMessageId = async () => {
      if (candidateId && jobId) {
        console.log("🔍 Retrieving thread info for threading...");
        console.log({
          candidateId,
          jobId,
          threadId,
        });
        
        // Get message ID from candidate thread storage
        const storedMessageId = await getMessageId(candidateId, jobId);
        console.log("Retrieved message ID for threading:", storedMessageId);
        setMessageId(storedMessageId);
        
        // Get full thread info for additional debug info
        const threadInfo = await getThreadInfo(candidateId, jobId);
        console.log("FULL THREAD INFO:", threadInfo);
      }
    };
    
    fetchMessageId();
  }, [threadId, candidateId, jobId, getMessageId, getThreadInfo]);

  const handleOpenThreadInGmail = useCallback((subject: string) => {
    console.log("Opening thread in Gmail with subject search:", subject);
    const searchQuery = encodeURIComponent(`subject:(${subject})`);
    window.open(`https://mail.google.com/mail/u/0/#search/${searchQuery}`, "_blank");
  }, []);

  return {
    messageId,
    handleOpenThreadInGmail
  };
};
