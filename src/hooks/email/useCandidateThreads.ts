
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
      console.log("Missing data for thread saving:", { jobId, newThreadId, candidateId });
      return false;
    }
    
    try {
      console.log("\n====== SAVING THREAD INFO ======");
      console.log(`Candidate ID: ${candidateId}`);
      console.log(`Job ID: ${jobId}`);
      console.log(`New Thread ID: ${newThreadId}`);
      console.log(`New Message ID: ${newMessageId || "Not provided"}`);
      console.log(`Existing Thread IDs: ${JSON.stringify(threadIds || {})}`);
      
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
      
      // Convert the Record to a plain object that satisfies the Json type
      const threadIdsObject: Record<string, { threadId: string; messageId: string }> = {};
      
      Object.entries(convertedThreadIds).forEach(([key, value]) => {
        threadIdsObject[key] = {
          threadId: value.threadId,
          messageId: value.messageId
        };
      });
      
      console.log("Final thread_ids object to be saved:", threadIdsObject);
      
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          thread_ids: threadIdsObject as Json
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
      
      console.log(`Thread info successfully saved for job: ${jobId}`);
      console.log("==============================\n");
      return true;
    } catch (err) {
      console.error("Error saving thread ID:", err);
      return false;
    }
  };
  
  const getThreadInfo = async (candidateId: string, jobId: string): Promise<ThreadInfo | null> => {
    if (!candidateId || !jobId) {
      console.log("Missing candidateId or jobId for getThreadInfo:", { candidateId, jobId });
      return null;
    }
    
    try {
      console.log(`Retrieving thread info for candidate ${candidateId} and job ${jobId}`);
      
      const { data, error } = await supabase
        .from('candidates')
        .select('thread_ids')
        .eq('id', candidateId)
        .single();
        
      if (error || !data) {
        console.error("Error getting thread IDs:", error);
        return null;
      }
      
      console.log(`Thread IDs data retrieved:`, data.thread_ids);
      
      // Handle both legacy format and new format
      const threadInfo = data.thread_ids?.[jobId];
      
      if (!threadInfo) {
        console.log(`No thread info found for job ${jobId}`);
        return null;
      }
      
      if (typeof threadInfo === 'string') {
        // Legacy format - convert on the fly
        console.log(`Found legacy thread format for job ${jobId}: ${threadInfo}`);
        return { threadId: threadInfo, messageId: threadInfo };
      }
      
      // New format
      console.log(`Found thread info for job ${jobId}:`, threadInfo);
      return threadInfo as ThreadInfo;
    } catch (err) {
      console.error("Error retrieving thread info:", err);
      return null;
    }
  };
  
  const getThreadId = async (candidateId: string, jobId: string): Promise<string | null> => {
    const threadInfo = await getThreadInfo(candidateId, jobId);
    const threadId = threadInfo?.threadId || null;
    console.log(`Retrieved thread ID for candidate ${candidateId}, job ${jobId}: ${threadId || "None found"}`);
    return threadId;
  };
  
  const getMessageId = async (candidateId: string, jobId: string): Promise<string | null> => {
    const threadInfo = await getThreadInfo(candidateId, jobId);
    const messageId = threadInfo?.messageId || null;
    console.log(`Retrieved message ID for candidate ${candidateId}, job ${jobId}: ${messageId || "None found"}`);
    return messageId;
  };

  return {
    saveThreadId,
    getThreadId,
    getMessageId,
    getThreadInfo
  };
};
