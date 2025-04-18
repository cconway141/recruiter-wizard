
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import { EmailThreadInfo } from "@/components/candidates/types";
import { EmailResult } from "./types";

export interface CandidateThreadData {
  candidateId: string;
  threadIds: Record<string, EmailThreadInfo>;
  jobId: string;
  newThreadId: string;
  newMessageId?: string;
}

export const getThreadMeta = async (candidateId: string, jobId: string) => {
  const { data } = await supabase
    .from("candidates")
    .select("thread_ids")
    .eq("id", candidateId)
    .maybeSingle();

  return data?.thread_ids?.[jobId] ?? { threadId: undefined, rfcMessageId: undefined };
};

export const useCandidateThreads = () => {
  // Helper functions that use getThreadMeta
  const getThreadId = async (candidateId: string, jobId: string): Promise<string | null> => {
    const { threadId } = await getThreadMeta(candidateId, jobId);
    return threadId ?? null;
  };

  const getMessageId = async (candidateId: string, jobId: string): Promise<string | null> => {
    const { rfcMessageId } = await getThreadMeta(candidateId, jobId);
    return rfcMessageId ?? null;
  };

  const getThreadInfo = async (candidateId: string, jobId: string): Promise<EmailThreadInfo | null> => {
    const { threadId, rfcMessageId } = await getThreadMeta(candidateId, jobId);
    return threadId || rfcMessageId ? { threadId, messageId: rfcMessageId } : null;
  };

  const saveThreadId = async ({ 
    candidateId, 
    threadIds, 
    jobId, 
    newThreadId,
    newMessageId
  }: CandidateThreadData) => {
    const { toast } = useToast();
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
      
      const updatedThreadIds = { ...threadIds };
      updatedThreadIds[jobId] = {
        threadId: newThreadId,
        messageId: newMessageId  // Kept as 'messageId' for backward compatibility
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
  
  return {
    saveThreadId,
    getThreadId,
    getMessageId,
    getThreadInfo,
    getThreadMeta
  };
};
