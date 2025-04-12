
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import { EmailThreadInfo } from "@/components/candidates/types";

interface CandidateThreadData {
  candidateId: string;
  threadIds: Record<string, EmailThreadInfo>;
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
  
  const getThreadInfo = async (candidateId: string, jobId: string): Promise<EmailThreadInfo | null> => {
    if (!candidateId || !jobId) {
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('thread_ids')
        .eq('id', candidateId)
        .maybeSingle();
        
      if (error || !data) {
        console.error("Error retrieving thread data:", error);
        return null;
      }
      
      // Safely access thread_ids
      const threadIds = data.thread_ids as Record<string, EmailThreadInfo> || {};
      
      // Get thread info for this job
      const threadInfo = threadIds[jobId];
      
      if (!threadInfo) {
        return null;
      }
      
      return threadInfo;
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
