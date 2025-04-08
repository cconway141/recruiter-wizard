
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { JobForm } from "@/components/forms/JobForm";
import { useJobs } from "@/contexts/JobContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { JobFormValues } from "@/components/forms/JobFormDetails";

const EditJob = () => {
  const { id } = useParams<{ id: string }>();
  const { getJob } = useJobs();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const job = id ? getJob(id) : undefined;

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

  useEffect(() => {
    if (id && !job) {
      // Job not found, redirect to dashboard
      navigate("/");
    } else {
      // Give a little time for form to initialize
      setTimeout(() => setIsLoading(false), 100);
    }
  }, [id, job, navigate]);

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
        <Form form={form}>
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
