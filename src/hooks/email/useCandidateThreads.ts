import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import { EmailThreadInfo } from "@/components/candidates/types";

export const useCandidateThreads = () => {
  const { toast } = useToast();

  const getThreadInfo = async (candidateId: string, jobId: string): Promise<EmailThreadInfo | null> => {
    if (!candidateId || !jobId) {
      console.warn("THREAD INFO: Missing candidateId or jobId");
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('thread_ids')
        .eq('id', candidateId)
        .maybeSingle();
        
      if (error || !data) {
        console.error("THREAD INFO RETRIEVAL ERROR:", { error, data });
        return null;
      }
      
      // Validate thread_ids structure
      const threadIds = (data.thread_ids as unknown as Record<string, EmailThreadInfo>) || {};
      console.log("THREAD IDS DEBUG:", { 
        candidateId, 
        jobId, 
        rawThreadIds: data.thread_ids,
        parsedThreadIds: threadIds,
        hasJobThreadInfo: !!threadIds[jobId]
      });
      
      const threadInfo = threadIds[jobId];
      
      if (!threadInfo) {
        console.warn("NO THREAD INFO FOR JOB:", { candidateId, jobId });
        return null;
      }
      
      // Validate threadId and messageId
      const isValidThreadInfo = 
        typeof threadInfo.threadId === 'string' && 
        typeof threadInfo.messageId === 'string' &&
        threadInfo.threadId.trim() !== '' &&
        threadInfo.messageId.trim() !== '';
      
      console.log("THREAD INFO VALIDATION:", {
        threadInfo,
        isValidThreadInfo,
        threadIdLength: threadInfo.threadId?.length,
        messageIdLength: threadInfo.messageId?.length
      });
      
      return isValidThreadInfo ? threadInfo : null;
    } catch (err) {
      console.error("UNEXPECTED ERROR IN getThreadInfo:", err);
      return null;
    }
  };

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
      console.log("Saving thread ID and message ID:", {
        candidateId,
        jobId,
        newThreadId,
        newMessageId
      });
      
      // Create new thread info
      if (!newMessageId) {
        console.warn("Missing messageId when saving thread info — using threadId as fallback to prevent threading issues.");
        newMessageId = newThreadId;
      }

      const updatedThreadIds = { ...threadIds };
      updatedThreadIds[jobId] = {
        threadId: newThreadId,
        messageId: newMessageId
      };
      
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          thread_ids: updatedThreadIds as unknown as Json
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
      
      console.log("Successfully saved thread and message IDs");
      return true;
    } catch (err) {
      console.error("Error saving thread ID:", err);
      return false;
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
