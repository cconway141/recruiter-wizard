
import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Job, JobStatus, Locale, Flavor } from "@/types/job";
import { calculateRates, generateInternalTitle, getWorkDetails, getPayDetails, generateM1, generateM2, generateM3 } from "@/utils/jobUtils";
import { useToast } from "@/components/ui/use-toast";
import { Candidate, CandidateStatus } from "@/components/candidates/CandidateEntry";

interface JobContextType {
  jobs: Job[];
  addJob: (job: Omit<Job, "id" | "internalTitle" | "highRate" | "mediumRate" | "lowRate" | "workDetails" | "payDetails" | "m1" | "m2" | "m3">) => void;
  updateJob: (job: Job) => void;
  deleteJob: (id: string) => void;
  getJob: (id: string) => Job | undefined;
  filteredJobs: Job[];
  setFilters: (filters: { search: string; status: JobStatus | "All"; locale: Locale | "All" }) => void;
  addCandidate: (jobId: string, name: string) => void;
  removeCandidate: (jobId: string, candidateId: string) => void;
  updateCandidateStatus: (jobId: string, candidateId: string, statusKey: keyof CandidateStatus, value: boolean) => void;
  getCandidates: (jobId: string) => Candidate[];
}

interface JobsState {
  jobs: Job[];
  candidates: Record<string, Candidate[]>; // jobId -> candidates[]
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<JobsState>({
    jobs: [],
    candidates: {}
  });
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [filters, setFiltersState] = useState({
    search: "",
    status: "All" as JobStatus | "All",
    locale: "All" as Locale | "All"
  });
  const { toast } = useToast();

  useEffect(() => {
    const storedData = localStorage.getItem("recruiterData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      // Handle backward compatibility for existing users
      if (Array.isArray(parsedData)) {
        setState({
          jobs: parsedData,
          candidates: {}
        });
      } else {
        setState(parsedData);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("recruiterData", JSON.stringify(state));
    applyFilters();
  }, [state, filters]);

  const applyFilters = () => {
    let result = [...state.jobs];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (job) =>
          job.internalTitle.toLowerCase().includes(searchLower) ||
          job.candidateFacingTitle.toLowerCase().includes(searchLower) ||
          job.client.toLowerCase().includes(searchLower) ||
          job.owner.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status !== "All") {
      result = result.filter((job) => job.status === filters.status);
    }

    // Apply locale filter
    if (filters.locale !== "All") {
      result = result.filter((job) => job.locale === filters.locale);
    }

    setFilteredJobs(result);
  };

  const setFilters = (newFilters: { search: string; status: JobStatus | "All"; locale: Locale | "All" }) => {
    setFiltersState(newFilters);
  };

  const addJob = (jobData: Omit<Job, "id" | "internalTitle" | "highRate" | "mediumRate" | "lowRate" | "workDetails" | "payDetails" | "m1" | "m2" | "m3">) => {
    const id = uuidv4();
    const internalTitle = generateInternalTitle(jobData.client, jobData.candidateFacingTitle, jobData.flavor, jobData.locale);
    const { high, medium, low } = calculateRates(jobData.rate);
    const workDetails = getWorkDetails(jobData.locale);
    const payDetails = getPayDetails(jobData.locale);
    
    // Generate placeholder messages (these would typically require candidate names)
    const m1 = generateM1("[First Name]", jobData.candidateFacingTitle, jobData.compDesc);
    const m2 = generateM2(jobData.candidateFacingTitle, payDetails, workDetails, jobData.skillsSought);
    const m3 = generateM3(jobData.videoQuestions);

    const newJob: Job = {
      ...jobData,
      id,
      internalTitle,
      highRate: high,
      mediumRate: medium,
      lowRate: low,
      workDetails,
      payDetails,
      m1,
      m2,
      m3
    };

    setState(prevState => ({
      ...prevState,
      jobs: [...prevState.jobs, newJob],
      candidates: {
        ...prevState.candidates,
        [id]: []
      }
    }));
    
    toast({
      title: "Job Added",
      description: `${internalTitle} has been added successfully.`,
    });
  };

  const updateJob = (updatedJob: Job) => {
    setState(prevState => ({
      ...prevState,
      jobs: prevState.jobs.map((job) => (job.id === updatedJob.id ? updatedJob : job))
    }));
    
    toast({
      title: "Job Updated",
      description: `${updatedJob.internalTitle} has been updated successfully.`,
    });
  };

  const deleteJob = (id: string) => {
    const jobToDelete = state.jobs.find(job => job.id === id);
    
    setState(prevState => {
      const { [id]: _, ...remainingCandidates } = prevState.candidates;
      return {
        ...prevState,
        jobs: prevState.jobs.filter((job) => job.id !== id),
        candidates: remainingCandidates
      };
    });
    
    toast({
      title: "Job Deleted",
      description: jobToDelete 
        ? `${jobToDelete.internalTitle} has been deleted.`
        : "Job has been deleted.",
      variant: "destructive",
    });
  };

  const getJob = (id: string) => {
    return state.jobs.find((job) => job.id === id);
  };

  // Candidate management functions
  const addCandidate = (jobId: string, name: string) => {
    const newCandidate: Candidate = {
      id: uuidv4(),
      name,
      status: {
        approved: false,
        preparing: false,
        submitted: false,
        interviewing: false,
        offered: false
      }
    };

    setState(prevState => ({
      ...prevState,
      candidates: {
        ...prevState.candidates,
        [jobId]: [
          ...(prevState.candidates[jobId] || []),
          newCandidate
        ]
      }
    }));

    toast({
      title: "Candidate Added",
      description: `${name} has been added to the candidate list.`,
    });
  };

  const removeCandidate = (jobId: string, candidateId: string) => {
    const candidate = state.candidates[jobId]?.find(c => c.id === candidateId);
    
    setState(prevState => ({
      ...prevState,
      candidates: {
        ...prevState.candidates,
        [jobId]: (prevState.candidates[jobId] || []).filter(c => c.id !== candidateId)
      }
    }));

    if (candidate) {
      toast({
        title: "Candidate Removed",
        description: `${candidate.name} has been removed from the candidate list.`,
      });
    }
  };

  const updateCandidateStatus = (
    jobId: string, 
    candidateId: string, 
    statusKey: keyof CandidateStatus, 
    value: boolean
  ) => {
    setState(prevState => ({
      ...prevState,
      candidates: {
        ...prevState.candidates,
        [jobId]: (prevState.candidates[jobId] || []).map(candidate => 
          candidate.id === candidateId 
            ? {
                ...candidate,
                status: {
                  ...candidate.status,
                  [statusKey]: value
                }
              }
            : candidate
        )
      }
    }));
  };

  const getCandidates = (jobId: string): Candidate[] => {
    return state.candidates[jobId] || [];
  };

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
        getCandidates
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
