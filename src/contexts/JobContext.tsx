
import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Job, JobStatus, Locale, Flavor } from "@/types/job";
import { calculateRates, generateInternalTitle, getWorkDetails, getPayDetails, generateM1, generateM2, generateM3 } from "@/utils/jobUtils";
import { useToast } from "@/components/ui/use-toast";
import { Candidate, CandidateStatus } from "@/components/candidates/CandidateEntry";
import { 
  isAirtableConfigured, 
  fetchJobsFromAirtable, 
  fetchCandidatesFromAirtable,
  addJobToAirtable,
  updateJobInAirtable,
  deleteJobFromAirtable,
  addCandidateToAirtable,
  updateCandidateInAirtable,
  deleteCandidateFromAirtable
} from "@/utils/airtableUtils";

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
  isAirtableEnabled: boolean;
  syncWithAirtable: () => Promise<void>;
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
  const [isAirtableEnabled, setIsAirtableEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize data from localStorage or Airtable
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      // Check if Airtable is configured
      const airtableConfigured = isAirtableConfigured();
      setIsAirtableEnabled(airtableConfigured);
      
      if (airtableConfigured) {
        try {
          // Fetch data from Airtable
          await syncWithAirtable();
        } catch (error) {
          console.error("Error initializing from Airtable:", error);
          loadFromLocalStorage();
        }
      } else {
        // Load from localStorage if Airtable is not configured
        loadFromLocalStorage();
      }
      
      setIsLoading(false);
    };
    
    initializeData();
  }, []);

  const loadFromLocalStorage = () => {
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
  };

  // Sync with Airtable
  const syncWithAirtable = async () => {
    if (!isAirtableConfigured()) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch jobs from Airtable
      const jobs = await fetchJobsFromAirtable();
      
      // Fetch candidates for each job
      const candidates: Record<string, Candidate[]> = {};
      for (const job of jobs) {
        const jobCandidates = await fetchCandidatesFromAirtable(job.id);
        candidates[job.id] = jobCandidates;
      }
      
      setState({
        jobs,
        candidates
      });
      
      // Also update localStorage as a backup
      localStorage.setItem("recruiterData", JSON.stringify({ jobs, candidates }));
      
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${jobs.length} jobs from Airtable.`,
      });
    } catch (error) {
      console.error("Error syncing with Airtable:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync with Airtable. Check your configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save data to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("recruiterData", JSON.stringify(state));
      applyFilters();
    }
  }, [state, filters, isLoading]);

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

  const addJob = async (jobData: Omit<Job, "id" | "internalTitle" | "highRate" | "mediumRate" | "lowRate" | "workDetails" | "payDetails" | "m1" | "m2" | "m3">) => {
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

    // Add to Airtable if configured
    let airtableId = null;
    if (isAirtableEnabled) {
      airtableId = await addJobToAirtable(newJob);
      
      if (airtableId) {
        // Use the Airtable-generated ID instead
        newJob.id = airtableId;
      }
    }

    setState(prevState => ({
      ...prevState,
      jobs: [...prevState.jobs, newJob],
      candidates: {
        ...prevState.candidates,
        [newJob.id]: []
      }
    }));
    
    toast({
      title: "Job Added",
      description: `${internalTitle} has been added successfully.`,
    });
  };

  const updateJob = async (updatedJob: Job) => {
    // Update in Airtable if configured
    if (isAirtableEnabled) {
      const success = await updateJobInAirtable(updatedJob);
      
      if (!success) {
        toast({
          title: "Update Failed",
          description: "Failed to update job in Airtable, but updated locally.",
          variant: "destructive",
        });
      }
    }

    setState(prevState => ({
      ...prevState,
      jobs: prevState.jobs.map((job) => (job.id === updatedJob.id ? updatedJob : job))
    }));
    
    toast({
      title: "Job Updated",
      description: `${updatedJob.internalTitle} has been updated successfully.`,
    });
  };

  const deleteJob = async (id: string) => {
    const jobToDelete = state.jobs.find(job => job.id === id);
    
    // Delete from Airtable if configured
    if (isAirtableEnabled && jobToDelete) {
      const success = await deleteJobFromAirtable(id);
      
      if (!success) {
        toast({
          title: "Delete Failed",
          description: "Failed to delete job in Airtable, but deleted locally.",
          variant: "destructive",
        });
      }
    }

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
  const addCandidate = async (jobId: string, name: string) => {
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

    // Add to Airtable if configured
    if (isAirtableEnabled) {
      const airtableId = await addCandidateToAirtable(jobId, newCandidate);
      
      if (airtableId) {
        // Use the Airtable-generated ID instead
        newCandidate.id = airtableId;
      }
    }

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

  const removeCandidate = async (jobId: string, candidateId: string) => {
    const candidate = state.candidates[jobId]?.find(c => c.id === candidateId);
    
    // Delete from Airtable if configured
    if (isAirtableEnabled && candidate) {
      const success = await deleteCandidateFromAirtable(candidateId);
      
      if (!success) {
        toast({
          title: "Delete Failed",
          description: "Failed to delete candidate in Airtable, but deleted locally.",
          variant: "destructive",
        });
      }
    }

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

  const updateCandidateStatus = async (
    jobId: string, 
    candidateId: string, 
    statusKey: keyof CandidateStatus, 
    value: boolean
  ) => {
    // First update the state
    setState(prevState => {
      const updatedCandidates = {
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
      };
      
      // Find the updated candidate for Airtable update
      const updatedCandidate = updatedCandidates[jobId]?.find(c => c.id === candidateId);
      
      // Update in Airtable if configured
      if (isAirtableEnabled && updatedCandidate) {
        updateCandidateInAirtable(jobId, updatedCandidate).catch(error => {
          console.error("Error updating candidate in Airtable:", error);
          toast({
            title: "Update Failed",
            description: "Failed to update candidate in Airtable, but updated locally.",
            variant: "destructive",
          });
        });
      }
      
      return {
        ...prevState,
        candidates: updatedCandidates
      };
    });
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
        getCandidates,
        isAirtableEnabled,
        syncWithAirtable
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
