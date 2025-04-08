
import { Candidate } from "@/components/candidates/CandidateEntry";
import { useLoadCandidates } from "./candidates/useLoadCandidates";
import { useAddCandidate } from "./candidates/useAddCandidate";
import { useRemoveCandidate } from "./candidates/useRemoveCandidate";
import { useUpdateCandidateStatus } from "./candidates/useUpdateCandidateStatus";
import { CandidateState } from "./candidates/types";

export function useCandidateOperations(
  candidates: CandidateState, 
  setCandidates: (candidates: CandidateState) => void
) {
  // Hook composition - use the smaller hooks
  const { loadCandidatesForJob, isLoading } = useLoadCandidates(candidates, setCandidates);
  const { addCandidate } = useAddCandidate(candidates, setCandidates);
  const { removeCandidate } = useRemoveCandidate(candidates, setCandidates);
  const { updateCandidateStatus } = useUpdateCandidateStatus(candidates, setCandidates);
  
  // Helper to get candidates for a job
  const getCandidates = (jobId: string): Candidate[] => {
    return candidates[jobId] || [];
  };

  return { 
    addCandidate, 
    removeCandidate, 
    updateCandidateStatus, 
    getCandidates,
    loadCandidatesForJob,
    isLoading
  };
}
