
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CandidateState } from "./types";

export function useRemoveCandidate(
  candidates: CandidateState,
  setCandidates: (candidates: CandidateState) => void
) {
  // Remove a candidate from a job
  const removeCandidate = async (jobId: string, candidateId: string) => {
    try {
      // Find the candidate to get the application id
      const candidate = candidates[jobId]?.find(c => c.id === candidateId);
      
      if (!candidate) {
        throw new Error("Candidate not found");
      }
      
      // Remove the application (not the candidate)
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('job_id', jobId)
        .eq('candidate_id', candidateId);
        
      if (error) throw error;
      
      // Update local state
      const updatedJobCandidates = candidates[jobId].filter(
        candidate => candidate.id !== candidateId
      );
      
      setCandidates({
        ...candidates,
        [jobId]: updatedJobCandidates
      });
      
      toast({
        title: "Candidate Removed",
        description: "The candidate has been removed from this job.",
      });
      
    } catch (error) {
      console.error("Error removing candidate:", error);
      toast({
        title: "Error Removing Candidate",
        description: "Failed to remove candidate. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { removeCandidate };
}
