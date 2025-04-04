
import React, { createContext, useContext } from "react";
import { JobContextType } from "@/types/contextTypes";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useJobFilters } from "@/hooks/useJobFilters";
import { useJobMutations } from "@/hooks/useJobMutations";
import { useCandidateOperations } from "@/hooks/useCandidateOperations";

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, isLoading, setJobs, setCandidates } = useSupabaseData();
  const { filteredJobs, setFilters } = useJobFilters(state.jobs);
  const { addJob, updateJob, deleteJob, getJob } = useJobMutations(state.jobs, setJobs);
  const { addCandidate, removeCandidate, updateCandidateStatus, getCandidates } = useCandidateOperations(state.candidates, setCandidates);
  
  // Flag for Airtable integration - currently disabled
  const [isAirtableEnabled] = React.useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <JobContext.Provider
      value={{
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
        isAirtableEnabled
      }}
    >
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
