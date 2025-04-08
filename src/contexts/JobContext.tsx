
import React, { createContext, useContext, useState } from "react";
import { JobContextType } from "@/types/contextTypes";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useJobFilters } from "@/hooks/useJobFilters";
import { useJobMutations } from "@/hooks/useJobMutations";
import { useCandidateOperations } from "@/hooks/useCandidateOperations";
import { Skeleton } from "@/components/ui/skeleton";

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, isLoading, setJobs, setCandidates, loadFromSupabase } = useSupabaseData();
  const { filteredJobs, setFilters } = useJobFilters(state.jobs);
  const { addJob, updateJob, deleteJob, getJob } = useJobMutations(state.jobs, setJobs);
  const { addCandidate, removeCandidate, updateCandidateStatus, getCandidates } = useCandidateOperations(state.candidates, setCandidates);
  
  // Flag for Airtable integration - currently disabled
  const [isAirtableEnabled] = useState(false);

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

  const contextValue: JobContextType = {
    jobs: state.jobs,
    addJob,
    updateJob,
    deleteJob,
    getJob,
    filteredJobs,
    setFilters,
    addCandidate,
    removeCandidate,
    updateCandidateStatus,
    getCandidates,
    isAirtableEnabled,
    loadFromSupabase
  };

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
