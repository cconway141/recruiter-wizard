
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { JobForm } from "@/components/forms/JobForm";
import { useJobs } from "@/contexts/JobContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { JobFormValues } from "@/components/forms/JobFormDetails";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";
import { useToast } from "@/hooks/use-toast";

const EditJob = () => {
  const { id } = useParams<{ id: string }>();
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
    defaultValues: job ? {
      candidateFacingTitle: job.candidateFacingTitle,
      client: job.client,
      compDesc: job.compDesc,
      locale: job.locale,
      flavor: job.flavor,
      status: job.status,
      rate: job.rate,
      jd: job.jd,
      skillsSought: job.skillsSought,
      minSkills: job.minSkills,
      owner: job.owner,
      videoQuestions: job.videoQuestions,
      screeningQuestions: job.screeningQuestions,
      workDetails: job.workDetails,
      payDetails: job.payDetails,
      other: job.other,
      m1: job.m1,
      m2: job.m2,
      m3: job.m3,
    } : {},
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
        status: data.status,
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
        locale: data.locale,
        localeId: data.locale_id,
        owner: data.owner,
        ownerId: data.owner_id,
        date: data.date,
        workDetails: data.work_details,
        payDetails: data.pay_details,
        other: data.other || "",
        videoQuestions: data.video_questions,
        screeningQuestions: data.screening_questions,
        flavor: data.flavor,
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

  // Show error state if we failed to load the job
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-10">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
          
          <div className="bg-destructive/10 p-6 rounded-lg text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
          </div>
        </main>
      </div>
    );
  }

  // Show loading state
  if (isLoading || isFetching || (!job && id)) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container py-10">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <PageHeader 
              title="Loading Job..." 
              description="Please wait while we retrieve the job details."
            />
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="h-8 w-8 animate-spin mx-auto text-gray-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-500">Loading job data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If no job found even after fetch attempts, redirect to dashboard
  if (!job) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <PageHeader 
            title={`Edit Job: ${job.internalTitle}`} 
            description="Update job details and message templates."
          />
        </div>
        <Form {...form}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg className="h-8 w-8 animate-spin mx-auto text-gray-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-500">Initializing form...</p>
              </div>
            </div>
          ) : (
            <JobForm job={job} isEditing />
          )}
        </Form>
      </main>
    </div>
  );
};

export default EditJob;
