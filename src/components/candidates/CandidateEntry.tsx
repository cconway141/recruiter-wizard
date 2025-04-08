
import React, { useState, useEffect } from "react";
import { useJobs } from "@/contexts/JobContext";
import { CandidateForm } from "./CandidateForm";
import { CandidateList } from "./CandidateList";
import { Candidate } from "./types";

interface CandidateEntryProps {
  jobId: string;
}

export const CandidateEntry: React.FC<CandidateEntryProps> = ({ jobId }) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const { 
    addCandidate, 
    removeCandidate, 
    updateCandidateStatus, 
    getCandidates,
    loadCandidatesForJob,
    candidatesLoading
  } = useJobs();
  
  const candidates = getCandidates(jobId);
  
  // Load candidates only once on initial component mount
  useEffect(() => {
    // Only load if we haven't loaded before and aren't currently loading
    if (isInitialLoad && !candidatesLoading) {
      loadCandidatesForJob(jobId);
      setIsInitialLoad(false);
    }
  }, [jobId, loadCandidatesForJob, isInitialLoad, candidatesLoading]);

  const handleAddCandidate = async (name: string, email: string, linkedinUrl: string) => {
    await addCandidate(jobId, {
      name,
      email,
      linkedinUrl
    });
  };

  const handleRemoveCandidate = (candidateId: string) => {
    removeCandidate(jobId, candidateId);
  };

  const handleStatusChange = (candidateId: string, statusKey: keyof Candidate['status']) => {
    updateCandidateStatus(jobId, candidateId, statusKey);
  };

  return (
    <div className="bg-white p-6 rounded-lg border mt-6">
      <h3 className="text-xl font-semibold mb-4 text-recruiter-primary">Candidates</h3>
      
      <CandidateForm onAddCandidate={handleAddCandidate} />
      
      <CandidateList 
        candidates={candidates}
        isLoading={candidatesLoading && isInitialLoad}
        onRemoveCandidate={handleRemoveCandidate}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};
