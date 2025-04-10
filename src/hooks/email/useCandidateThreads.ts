
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ThreadInfo {
  threadId: string;
  messageId: string;
}

interface CandidateThreadData {
  candidateId: string;
  threadIds: Record<string, ThreadInfo | string>; // Support legacy format
  jobId?: string;
  newThreadId?: string;
  newMessageId?: string;
}

export const useCandidateThreads = () => {
  const { toast } = useToast();

  const saveThreadId = async ({ 
    candidateId, 
    threadIds, 
    jobId, 
    newThreadId,
    newMessageId
  }: CandidateThreadData) => {
    if (!jobId || !newThreadId || !candidateId) {
      console.log("Missing data for thread saving:", { jobId, newThreadId, candidateId });
      return false;
    }
    
    try {
      console.log("New thread ID created:", newThreadId);
      console.log("New message ID created:", newMessageId);
      console.log("Saving thread info for job:", jobId);
      
      // Convert legacy format if needed
      const convertedThreadIds: Record<string, ThreadInfo> = {};
      
      // Copy existing threads with conversion from legacy format
      Object.entries(threadIds || {}).forEach(([key, value]) => {
        if (typeof value === 'string') {
          // Legacy format, just threadId as string
          convertedThreadIds[key] = { threadId: value, messageId: value };
        } else {
          // Already in new format
          convertedThreadIds[key] = value as ThreadInfo;
        }
      });
      
      // Add the new thread info
      convertedThreadIds[jobId] = {
        threadId: newThreadId,
        messageId: newMessageId || newThreadId // Fallback to threadId if messageId not provided
      };
      
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          thread_ids: convertedThreadIds
        })
        .eq('id', candidateId);
        
      if (updateError) {
        console.error("Error updating candidate thread ID:", updateError);
        toast({
          title: "Warning",
          description: "Email sent, but failed to save thread ID for future emails.",
          variant: "destructive"
        });
        return false;
      } 
      
      console.log("Thread info saved for job:", jobId, "Thread ID:", newThreadId, "Message ID:", newMessageId);
      return true;
    } catch (err) {
      console.error("Error saving thread ID:", err);
      return false;
    }
  };
  
  const getThreadInfo = async (candidateId: string, jobId: string): Promise<ThreadInfo | null> => {
    if (!candidateId || !jobId) {
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('thread_ids')
        .eq('id', candidateId)
        .single();
        
      if (error || !data) {
        console.error("Error getting thread IDs:", error);
        return null;
      }
      
      // Handle both legacy format and new format
      const threadInfo = data.thread_ids?.[jobId];
      
      if (!threadInfo) {
        return null;
      }
      
      if (typeof threadInfo === 'string') {
        // Legacy format - convert on the fly
        return { threadId: threadInfo, messageId: threadInfo };
      }
      
      // New format
      return threadInfo as ThreadInfo;
    } catch (err) {
      console.error("Error retrieving thread info:", err);
      return null;
    }
  };
  
  const getThreadId = async (candidateId: string, jobId: string): Promise<string | null> => {
    const threadInfo = await getThreadInfo(candidateId, jobId);
    return threadInfo?.threadId || null;
  };
  
  const getMessageId = async (candidateId: string, jobId: string): Promise<string | null> => {
    const threadInfo = await getThreadInfo(candidateId, jobId);
    return threadInfo?.messageId || null;
  };

  return {
    saveThreadId,
    getThreadId,
    getMessageId,
    getThreadInfo
  };
};
