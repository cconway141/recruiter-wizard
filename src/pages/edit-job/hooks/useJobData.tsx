
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useJobs } from "@/contexts/JobContext";
import { supabase } from "@/integrations/supabase/client";
import { Job, LocaleObject, StatusObject } from "@/types/job";
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
      
      // Fetch the job data
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (jobError) {
        throw jobError;
      }

      if (!jobData) {
        throw new Error("Job not found");
      }
      
      // Fetch locale information to get abbreviation
      const { data: localeData, error: localeError } = await supabase
        .from('locales')
        .select('*')
        .eq('name', jobData.locale)
        .single();
        
      if (localeError && localeError.code !== 'PGRST116') {
        console.warn("Error fetching locale:", localeError);
      }

      // Create locale object with all required properties
      const localeObject: LocaleObject = {
        id: jobData.locale,
        name: jobData.locale,
        abbreviation: localeData?.abbreviation || '',
        workDetails: jobData.work_details || '',
        payDetails: jobData.pay_details || ''
      };

      // Create standardized status object
      const statusObject: StatusObject = {
        id: jobData.status_id || '',
        name: jobData.status || 'Active'
      };

      const transformedJob: Job = {
        id: jobData.id,
        internalTitle: jobData.internal_title,
        candidateFacingTitle: jobData.candidate_facing_title,
        jd: jobData.jd,
        status: statusObject, // Use standardized status object
        statusId: jobData.status_id || '',
        m1: jobData.m1,
        m2: jobData.m2,
        m3: jobData.m3,
        skillsSought: jobData.skills_sought,
        minSkills: jobData.min_skills,
        linkedinSearch: jobData.linkedin_search,
        lir: jobData.lir,
        client: jobData.client,
        clientId: jobData.client_id || '',
        compDesc: jobData.comp_desc,
        rate: Number(jobData.rate),
        highRate: Number(jobData.high_rate),
        mediumRate: Number(jobData.medium_rate),
        lowRate: Number(jobData.low_rate),
        locale: localeObject,
        localeId: jobData.locale_id || '',
        owner: jobData.owner,
        ownerId: jobData.owner_id || '',
        date: jobData.date,
        workDetails: jobData.work_details || '',
        payDetails: jobData.pay_details || '',
        other: jobData.other || "",
        videoQuestions: jobData.video_questions || '',
        screeningQuestions: jobData.screening_questions || '',
        flavor: jobData.flavor,
        flavorId: jobData.flavor_id || '',
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
