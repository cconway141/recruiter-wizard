
import React, { createContext, useContext, useState, useEffect } from "react";
import { Job, JobStatus, Locale, Flavor } from "@/types/job";
import { calculateRates, generateInternalTitle, getWorkDetails, getPayDetails, generateM1, generateM2, generateM3 } from "@/utils/jobUtils";
import { toast } from "@/components/ui/use-toast";
import { Candidate, CandidateStatus } from "@/components/candidates/CandidateEntry";
import { supabase } from "@/integrations/supabase/client";

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
  const [isAirtableEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data from Supabase
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      try {
        await loadFromSupabase();
      } catch (error) {
        console.error("Error loading data from Supabase:", error);
        toast({
          title: "Error Loading Data",
          description: "Failed to load data from the database. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, []);

  const loadFromSupabase = async () => {
    // Load jobs with related data from Supabase
    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .select(`
        *,
        clients(*),
        flavors(*),
        locales(*),
        job_statuses(*),
        profiles(*)
      `);
    
    if (jobsError) {
      throw jobsError;
    }

    // Update state with data from Supabase
    if (jobsData) {
      const transformedJobs: Job[] = jobsData.map(job => ({
        id: job.id,
        internalTitle: job.internal_title,
        candidateFacingTitle: job.candidate_facing_title,
        jd: job.jd,
        status: job.status as JobStatus,
        m1: job.m1,
        m2: job.m2,
        m3: job.m3,
        skillsSought: job.skills_sought,
        minSkills: job.min_skills,
        linkedinSearch: job.linkedin_search,
        lir: job.lir,
        client: job.client,
        clientId: job.client_id,
        compDesc: job.comp_desc,
        rate: Number(job.rate),
        highRate: Number(job.high_rate),
        mediumRate: Number(job.medium_rate),
        lowRate: Number(job.low_rate),
        locale: job.locale as Locale,
        localeId: job.locale_id,
        owner: job.owner,
        ownerId: job.owner_id,
        date: job.date,
        workDetails: job.work_details,
        payDetails: job.pay_details,
        other: job.other || "",
        videoQuestions: job.video_questions,
        screeningQuestions: job.screening_questions,
        flavor: job.flavor as Flavor,
        flavorId: job.flavor_id,
        statusId: job.status_id
      }));

      setState({
        jobs: transformedJobs,
        candidates: {}
      });
    }
  };

  // Apply filters effect
  useEffect(() => {
    if (!isLoading) {
      applyFilters();
    }
  }, [state.jobs, filters, isLoading]);

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
    const internalTitle = generateInternalTitle(jobData.client, jobData.candidateFacingTitle, jobData.flavor, jobData.locale);
    const { high, medium, low } = calculateRates(jobData.rate);
    const workDetails = getWorkDetails(jobData.locale);
    const payDetails = getPayDetails(jobData.locale);
    
    // Generate placeholder messages
    const m1 = generateM1("[First Name]", jobData.candidateFacingTitle, jobData.compDesc);
    const m2 = generateM2(jobData.candidateFacingTitle, payDetails, workDetails, jobData.skillsSought);
    const m3 = generateM3(jobData.videoQuestions);

    // Get the IDs for the relations
    const { data: clientData } = await supabase
      .from('clients')
      .select('id')
      .eq('name', jobData.client)
      .single();
      
    const { data: localeData } = await supabase
      .from('locales')
      .select('id')
      .eq('name', jobData.locale)
      .single();
      
    const { data: flavorData } = await supabase
      .from('flavors')
      .select('id')
      .eq('name', jobData.flavor)
      .single();
      
    const { data: statusData } = await supabase
      .from('job_statuses')
      .select('id')
      .eq('name', jobData.status)
      .single();
      
    const { data: ownerData } = await supabase
      .from('profiles')
      .select('id')
      .eq('display_name', jobData.owner)
      .single();

    // Insert into Supabase with IDs
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        internal_title: internalTitle,
        candidate_facing_title: jobData.candidateFacingTitle,
        jd: jobData.jd,
        status: jobData.status,
        skills_sought: jobData.skillsSought,
        min_skills: jobData.minSkills,
        linkedin_search: jobData.linkedinSearch,
        lir: jobData.lir,
        client: jobData.client,
        client_id: clientData?.id,
        comp_desc: jobData.compDesc,
        rate: jobData.rate,
        high_rate: high,
        medium_rate: medium,
        low_rate: low,
        locale: jobData.locale,
        locale_id: localeData?.id,
        owner: jobData.owner,
        owner_id: ownerData?.id,
        date: jobData.date,
        work_details: workDetails,
        pay_details: payDetails,
        other: jobData.other,
        video_questions: jobData.videoQuestions,
        screening_questions: jobData.screeningQuestions,
        flavor: jobData.flavor,
        flavor_id: flavorData?.id,
        status_id: statusData?.id,
        m1: m1,
        m2: m2,
        m3: m3
      })
      .select();

    if (error) {
      console.error("Error adding job:", error);
      toast({
        title: "Error Adding Job",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data && data.length > 0) {
      // Transform the returned data to match our Job interface
      const newJob: Job = {
        id: data[0].id,
        internalTitle,
        candidateFacingTitle: jobData.candidateFacingTitle,
        jd: jobData.jd,
        status: jobData.status,
        skillsSought: jobData.skillsSought,
        minSkills: jobData.minSkills,
        linkedinSearch: jobData.linkedinSearch,
        lir: jobData.lir,
        client: jobData.client,
        clientId: data[0].client_id,
        compDesc: jobData.compDesc,
        rate: jobData.rate,
        highRate: high,
        mediumRate: medium,
        lowRate: low,
        locale: jobData.locale,
        localeId: data[0].locale_id,
        owner: jobData.owner,
        ownerId: data[0].owner_id,
        date: jobData.date,
        workDetails: workDetails,
        payDetails: payDetails,
        other: jobData.other || "",
        videoQuestions: jobData.videoQuestions,
        screeningQuestions: jobData.screeningQuestions,
        flavor: jobData.flavor,
        flavorId: data[0].flavor_id,
        statusId: data[0].status_id,
        m1,
        m2,
        m3
      };

      // Update local state
      setState(prevState => ({
        ...prevState,
        jobs: [...prevState.jobs, newJob],
      }));
      
      toast({
        title: "Job Added",
        description: `${internalTitle} has been added successfully.`,
      });
    }
  };

  const updateJob = async (updatedJob: Job) => {
    // Update in Supabase
    const { error } = await supabase
      .from('jobs')
      .update({
        internal_title: updatedJob.internalTitle,
        candidate_facing_title: updatedJob.candidateFacingTitle,
        jd: updatedJob.jd,
        status: updatedJob.status,
        m1: updatedJob.m1,
        m2: updatedJob.m2,
        m3: updatedJob.m3,
        skills_sought: updatedJob.skillsSought,
        min_skills: updatedJob.minSkills,
        linkedin_search: updatedJob.linkedinSearch,
        lir: updatedJob.lir,
        client: updatedJob.client,
        client_id: updatedJob.clientId,
        comp_desc: updatedJob.compDesc,
        rate: updatedJob.rate,
        high_rate: updatedJob.highRate,
        medium_rate: updatedJob.mediumRate,
        low_rate: updatedJob.lowRate,
        locale: updatedJob.locale,
        locale_id: updatedJob.localeId,
        owner: updatedJob.owner,
        owner_id: updatedJob.ownerId,
        date: updatedJob.date,
        work_details: updatedJob.workDetails,
        pay_details: updatedJob.payDetails,
        other: updatedJob.other,
        video_questions: updatedJob.videoQuestions,
        screening_questions: updatedJob.screeningQuestions,
        flavor: updatedJob.flavor,
        flavor_id: updatedJob.flavorId,
        status_id: updatedJob.statusId
      })
      .eq('id', updatedJob.id);

    if (error) {
      console.error("Error updating job:", error);
      toast({
        title: "Error Updating Job",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Update local state
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
    
    // Delete from Supabase
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error Deleting Job",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Update local state
    setState(prevState => {
      return {
        ...prevState,
        jobs: prevState.jobs.filter((job) => job.id !== id),
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

  // Placeholder functions for candidate management since we removed the candidates table
  const addCandidate = async (jobId: string, name: string) => {
    toast({
      title: "Feature Unavailable",
      description: "Candidate management is currently disabled.",
      variant: "destructive",
    });
  };

  const removeCandidate = async (jobId: string, candidateId: string) => {
    toast({
      title: "Feature Unavailable",
      description: "Candidate management is currently disabled.",
      variant: "destructive",
    });
  };

  const updateCandidateStatus = async (
    jobId: string, 
    candidateId: string, 
    statusKey: keyof CandidateStatus, 
    value: boolean
  ) => {
    toast({
      title: "Feature Unavailable",
      description: "Candidate management is currently disabled.",
      variant: "destructive",
    });
  };

  const getCandidates = (jobId: string): Candidate[] => {
    return []; // Return empty array since candidates functionality is removed
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
