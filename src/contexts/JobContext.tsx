
import React, { createContext, useContext, useState, useMemo } from "react";
import { JobContextType } from "@/types/contextTypes";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useJobFilters, JobFilters } from "@/hooks/useJobFilters";
import { useJobMutations } from "@/hooks/useJobMutations";
import { useCandidateOperations } from "@/hooks/useCandidateOperations";
import { Skeleton } from "@/components/ui/skeleton";
import { Candidate } from "@/components/candidates/CandidateEntry";

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, isLoading, setJobs, setCandidates, loadFromSupabase } = useSupabaseData();
  const { filteredJobs, filters, setFilters } = useJobFilters(state.jobs);
  const { addJob, updateJob, deleteJob, getJob } = useJobMutations(state.jobs, setJobs);
  const { 
    addCandidate, 
    removeCandidate, 
    updateCandidateStatus, 
    getCandidates,
    loadCandidatesForJob,
    isLoading: candidatesLoading
  } = useCandidateOperations(state.candidates, setCandidates);
  
  // Flag for Airtable integration - currently disabled
  const [isAirtableEnabled] = useState(false);

  // Memoize the context value to prevent unnecessary rerenders
  const contextValue = useMemo<JobContextType>(() => ({
    jobs: state.jobs,
    addJob,
    updateJob,
    deleteJob,
    getJob,
    filteredJobs,
    filters,
    setFilters,
    addCandidate,
    removeCandidate,
    updateCandidateStatus,
    getCandidates,
    loadCandidatesForJob,
    isAirtableEnabled,
    loadFromSupabase,
    candidatesLoading
  }), [
    state.jobs,
    addJob,
    updateJob,
    deleteJob,
    getJob,
    filteredJobs,
    filters,
    setFilters,
    addCandidate,
    removeCandidate,
    updateCandidateStatus,
    getCandidates,
    loadCandidatesForJob,
    isAirtableEnabled,
    loadFromSupabase,
    candidatesLoading
  ]);

  // Create a loading placeholder to show while data is being fetched
  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <JobContext.Provider value={contextValue}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error("useJobs must be used within a JobProvider");
  }
  return context;
};
