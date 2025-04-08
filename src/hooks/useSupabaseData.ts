
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Job, JobStatus, Locale, Flavor } from "@/types/job";
import { JobsState } from "@/types/contextTypes";
import { Candidate } from "@/components/candidates/CandidateEntry";

export function useSupabaseData() {
  const [state, setState] = useState<JobsState>({
    jobs: [],
    candidates: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  const loadingRef = useRef(false);

  const loadFromSupabase = useCallback(async () => {
    // Prevent excessive reloading (throttle to once per second)
    const now = Date.now();
    if (now - lastLoadTime < 1000 || loadingRef.current) {
      return;
    }
    
    console.log("Loading data from Supabase...");
    try {
      // Set loading state to true while fetching
      loadingRef.current = true;
      setLastLoadTime(now);
      
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
        
        console.log(`Loaded ${transformedJobs.length} jobs from Supabase`);

        setState(prevState => ({
          ...prevState,
          jobs: transformedJobs
        }));
      }
    } catch (error) {
      console.error("Error loading data from Supabase:", error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load data from the database. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      // Always set loading to false when done
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [lastLoadTime]);

  // Initialize data from Supabase
  useEffect(() => {
    loadFromSupabase();
  }, [loadFromSupabase]);

  const setJobs = useCallback((jobs: Job[]) => {
    setState(prevState => ({
      ...prevState,
      jobs
    }));
  }, []);

  const setCandidates = useCallback((candidates: Record<string, Candidate[]>) => {
    setState(prevState => ({
      ...prevState,
      candidates
    }));
  }, []);

  return { 
    state, 
    isLoading, 
    setJobs,
    setCandidates,
    loadFromSupabase
  };
}
