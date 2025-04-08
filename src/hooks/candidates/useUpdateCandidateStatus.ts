
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Candidate, CandidateStatus } from "@/components/candidates/types";
import { CandidateState, dbStatusMap } from "./types";

export function useUpdateCandidateStatus(
  candidates: CandidateState,
  setCandidates: (candidates: CandidateState) => void
) {
  // Update candidate status
  const updateCandidateStatus = async (
    jobId: string, 
    candidateId: string, 
    statusKey: keyof CandidateStatus
  ) => {
    try {
      const candidate = candidates[jobId]?.find(c => c.id === candidateId);
      
      if (!candidate) {
        throw new Error("Candidate not found");
      }
      
      const dbColumn = dbStatusMap[statusKey];
      
      // Get current status
      const currentValue = candidate.status[statusKey];
      
      // Update the status in the database
      const { error } = await supabase
        .from('applications')
        .update({
          [dbColumn]: !currentValue,
          status: !currentValue ? statusKey : 'pending_approval' // Update the main status field
        })
        .eq('job_id', jobId)
        .eq('candidate_id', candidateId);
        
      if (error) throw error;
      
      // Update local state
      const updatedCandidates = candidates[jobId].map(c => {
        if (c.id === candidateId) {
          return {
            ...c,
            status: {
              ...c.status,
              [statusKey]: !c.status[statusKey]
            }
          };
        }
        return c;
      });
      
      setCandidates({
        ...candidates,
        [jobId]: updatedCandidates
      });
      
      toast({
        title: "Status Updated",
        description: `Candidate status has been ${!currentValue ? 'set to' : 'removed from'} ${String(statusKey)}.`,
      });
      
    } catch (error) {
      console.error("Error updating candidate status:", error);
      toast({
        title: "Error Updating Status",
        description: "Failed to update candidate status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { updateCandidateStatus };
}
