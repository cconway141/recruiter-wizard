
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
  const { getJob, loadFromSupabase } = useJobs();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localJob, setLocalJob] = useState<Job | undefined>(undefined);
  const { toast } = useToast();

  // First try to get the job from context
  const contextJob = id ? getJob(id) : undefined;
  // Use either the job from context or our local fetched job
  const job = contextJob || localJob;

  // Create form instance here to pass down to JobForm
  const form = useForm<JobFormValues>({
    defaultValues: job ? mapJobToFormDefaults(job) : {},
  });

  // Fetch job directly from Supabase if it's not in the context
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

      // Transform the job data to match our expected format
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
      
      // Also refresh the global job list to include this job for future use
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
    // If job not found in context and we have an ID, fetch it directly
    if (!contextJob && id && !localJob && !isFetching) {
      fetchJobFromSupabase(id);
    } else if (!id) {
      // No ID provided, redirect to dashboard
      navigate("/");
    } else if (contextJob || localJob) {
      // Job found (either in context or fetched), give a little time for form to initialize
      setTimeout(() => setIsLoading(false), 100);
    }
  }, [id, contextJob, localJob, isFetching, navigate]);

  return { job, form, isLoading, isFetching, error };
}
