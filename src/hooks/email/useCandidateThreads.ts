
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

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
      console.error("Missing required data for thread saving:", { jobId, newThreadId, candidateId });
      return false;
    }
    
    try {
      console.group("THREAD STORAGE");
      console.log(`Saving thread info for candidate ${candidateId}, job ${jobId}`);
      console.log(`Thread ID: ${newThreadId}`);
      console.log(`Message ID: ${newMessageId || newThreadId}`);
      
      // Convert legacy format if needed
      const convertedThreadIds: Record<string, ThreadInfo> = {};
      
      // Copy existing threads with conversion from legacy format
      Object.entries(threadIds || {}).forEach(([key, value]) => {
        if (typeof value === 'string') {
          // Legacy format, just threadId as string
          convertedThreadIds[key] = { threadId: value, messageId: value };
          console.log(`Converting legacy thread format for job ${key}: ${value}`);
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
      
      console.log(`Updated thread info for job ${jobId}:`, convertedThreadIds[jobId]);
      console.log("Full thread_ids object:", convertedThreadIds);
      
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          thread_ids: convertedThreadIds as unknown as Json
        })
        .eq('id', candidateId);
        
      if (updateError) {
        console.error("Error updating candidate thread ID:", updateError);
        toast({
          title: "Warning",
          description: "Email sent, but failed to save thread ID for future emails.",
          variant: "destructive"
        });
        console.groupEnd();
        return false;
      } 
      
      console.log(`Thread info successfully saved for job: ${jobId}`);
      console.groupEnd();
      return true;
    } catch (err) {
      console.error("Error saving thread ID:", err);
      console.groupEnd();
      return false;
    }
  };
  
  const getThreadInfo = async (candidateId: string, jobId: string): Promise<ThreadInfo | null> => {
    if (!candidateId || !jobId) {
      console.error("Missing candidateId or jobId for getThreadInfo:", { candidateId, jobId });
      return null;
    }
    
    try {
      console.group("THREAD RETRIEVAL");
      console.log(`Retrieving thread info for candidate ${candidateId} and job ${jobId}`);
      
      const { data, error } = await supabase
        .from('candidates')
        .select('thread_ids')
        .eq('id', candidateId)
        .single();
        
      if (error || !data || !data.thread_ids) {
        console.error("Error getting thread IDs or data not found:", error);
        console.groupEnd();
        return null;
      }
      
      console.log(`Thread IDs data retrieved:`, data.thread_ids);
      
      // Handle both legacy format and new format
      const threadInfo = data.thread_ids[jobId];
      
      if (!threadInfo) {
        console.log(`No thread info found for job ${jobId}`);
        console.groupEnd();
        return null;
      }
      
      if (typeof threadInfo === 'string') {
        // Legacy format - convert on the fly
        console.log(`Found legacy thread format for job ${jobId}: ${threadInfo}`);
        console.groupEnd();
        return { threadId: threadInfo, messageId: threadInfo };
      }
      
      // New format
      console.log(`Found thread info for job ${jobId}:`, threadInfo);
      console.groupEnd();
      return threadInfo as ThreadInfo;
    } catch (err) {
      console.error("Error retrieving thread info:", err);
      console.groupEnd();
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
