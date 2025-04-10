
import React, { useState, useEffect, useRef } from "react";
import { useJobs } from "@/contexts/JobContext";
import { CandidateForm } from "./CandidateForm";
import { CandidateList } from "./CandidateList";
import { Candidate } from "./types";

interface CandidateEntryProps {
  jobId: string;
}

export const CandidateEntry: React.FC<CandidateEntryProps> = ({ jobId }) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const loadAttemptRef = useRef(false);
  
  const { 
    addCandidate, 
    removeCandidate, 
    updateCandidateStatus, 
    getCandidates,
    loadCandidatesForJob,
    candidatesLoading
  } = useJobs();
  
  const candidates = getCandidates(jobId);
  
  // Load candidates only once on initial component mount or if no candidates exist
  useEffect(() => {
    const loadCandidates = async () => {
      if ((isInitialLoad || candidates.length === 0) && !loadAttemptRef.current) {
        console.log("Loading candidates for job:", jobId);
        loadAttemptRef.current = true;
        await loadCandidatesForJob(jobId);
        setIsInitialLoad(false);
      }
    };
    
    loadCandidates();
    
    // Set up a refresh timer to reload candidates periodically
    const refreshTimer = setInterval(() => {
      console.log("Refreshing candidates for job:", jobId);
      loadCandidatesForJob(jobId);
    }, 60000); // Refresh every minute
    
    return () => {
      clearInterval(refreshTimer);
    };
  }, [jobId, loadCandidatesForJob, isInitialLoad, candidates.length]);

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
        isLoading={candidatesLoading && (isInitialLoad || candidates.length === 0)}
        onRemoveCandidate={handleRemoveCandidate}
        onStatusChange={handleStatusChange}
        jobId={jobId} // Pass the jobId to CandidateList
      />
    </div>
  );
};
