
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CandidateThreadData {
  candidateId: string;
  threadIds: Record<string, string>;
  jobId?: string;
  newThreadId?: string;
}

export const useCandidateThreads = () => {
  const { toast } = useToast();

  const saveThreadId = async ({ 
    candidateId, 
    threadIds, 
    jobId, 
    newThreadId 
  }: CandidateThreadData) => {
    if (!jobId || !newThreadId || !candidateId) {
      console.log("Missing data for thread saving:", { jobId, newThreadId, candidateId });
      return false;
    }
    
    try {
      console.log("New thread ID created:", newThreadId);
      console.log("Saving thread ID for job:", jobId);
      
      // Update the existing threadIds with the new one for this job
      const threadIdsUpdate = { ...(threadIds || {}), [jobId]: newThreadId };
      
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          thread_ids: threadIdsUpdate
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
      
      console.log("Thread ID saved for job:", jobId, "Thread ID:", newThreadId);
      return true;
    } catch (err) {
      console.error("Error saving thread ID:", err);
      return false;
    }
  };
  
  const getThreadId = async (candidateId: string, jobId: string) => {
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
      
      // Return the thread ID for this specific job if it exists
      return data.thread_ids?.[jobId] || null;
    } catch (err) {
      console.error("Error retrieving thread ID:", err);
      return null;
    }
  };

  return {
    saveThreadId,
    getThreadId
  };
};
