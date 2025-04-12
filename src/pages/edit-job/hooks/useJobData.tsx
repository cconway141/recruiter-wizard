
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useJobs } from "@/contexts/JobContext";
import { supabase } from "@/integrations/supabase/client";
import { Job, JobStatus, Locale, Flavor } from "@/types/job";
import { JobFormValues } from "@/components/forms/JobFormDetails";
import { useToast } from "@/hooks/use-toast";
import { mapJobToFormDefaults } from "@/utils/mapJobToFormDefaults";

export function useJobData(id?: string) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localJob, setLocalJob] = useState<Job | undefined>(undefined);
  const { toast } = useToast();

  // Safely access the useJobs hook
  let jobContext;
  try {
    jobContext = useJobs();
  } catch (error) {
    console.error("Error accessing job context:", error);
    // Return default values if the context isn't available
    return { 
      job: undefined, 
      form: useForm<JobFormValues>(), 
      isLoading: false, 
      isFetching: false, 
      error: "Job context not available" 
    };
  }
  
  const { getJob, loadFromSupabase } = jobContext;
  const contextJob = id ? getJob(id) : undefined;
  const job = contextJob || localJob;

  const form = useForm<JobFormValues>({
    defaultValues: job ? mapJobToFormDefaults(job) : {},
  });

  const fetchJobFromSupabase = async (jobId: string) => {
    setIsFetching(true);
    setError(null);
    try {
      console.log(`Fetching job ${jobId} directly from Supabase...`);
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          clients(*),
          flavors(*),
          locales(*),
          job_statuses(*),
          profiles(*)
        `)
        .eq('id', jobId)
        .single();
      
      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Job not found");
      }

      const transformedJob: Job = {
        id: data.id,
        internalTitle: data.internal_title,
        candidateFacingTitle: data.candidate_facing_title,
        jd: data.jd,
        status: data.status as JobStatus,
        m1: data.m1,
        m2: data.m2,
        m3: data.m3,
        skillsSought: data.skills_sought,
        minSkills: data.min_skills,
        linkedinSearch: data.linkedin_search,
        lir: data.lir,
        client: data.client,
        clientId: data.client_id,
        compDesc: data.comp_desc,
        rate: Number(data.rate),
        highRate: Number(data.high_rate),
        mediumRate: Number(data.medium_rate),
        lowRate: Number(data.low_rate),
        locale: data.locale as Locale,
        localeId: data.locale_id,
        owner: data.owner,
        ownerId: data.owner_id,
        date: data.date,
        workDetails: data.work_details,
        payDetails: data.pay_details,
        other: data.other || "",
        videoQuestions: data.video_questions,
        screeningQuestions: data.screening_questions,
        flavor: data.flavor as Flavor,
        flavorId: data.flavor_id,
        statusId: data.status_id
      };

      setLocalJob(transformedJob);
      
      loadFromSupabase();
      
      return transformedJob;
    } catch (error) {
      console.error("Error fetching job:", error);
      setError("Failed to load job. It may have been deleted or you don't have access.");
      toast({
        title: "Failed to load job",
        description: "The job could not be found or loaded",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (!contextJob && id && !localJob && !isFetching) {
      fetchJobFromSupabase(id);
    } else if (!id) {
      navigate("/");
    } else if (contextJob || localJob) {
      setTimeout(() => setIsLoading(false), 100);
    }
  }, [id, contextJob, localJob, isFetching, navigate]);

  return { job, form, isLoading, isFetching, error };
}
