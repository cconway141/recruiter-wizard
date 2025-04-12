
import { useCallback } from "react";
import { NavigateFunction } from "react-router-dom";
import { Job } from "@/types/job";
import { JobFormValues } from "../../JobFormDetails";

interface FormSubmissionProps {
  isEditing: boolean;
  job?: Job;
  addJob: (job: any) => Promise<Job | null>;
  updateJob: (jobId: string, job: any) => Promise<Job | null>;
  navigate: NavigateFunction;
  toast: any;
}

export function useFormSubmission({ 
  isEditing, 
  job, 
  addJob, 
  updateJob, 
  navigate, 
  toast 
}: FormSubmissionProps) {
  
  const processFormSubmission = useCallback(
    async (formData: JobFormValues): Promise<Job> => {
      console.log("Processing form submission:", { isEditing, formData });
      
      try {
        if (isEditing && job) {
          // Update existing job
          console.log("Updating job:", job.id);
          const updatedJob = await updateJob(job.id, formData);
          
          if (!updatedJob) {
            throw new Error("Failed to update job");
          }
          
          toast({
            title: "Job Updated",
            description: "The job has been successfully updated.",
          });
          
          navigate(`/jobs/${job.id}`);
          return updatedJob;
        } else {
          // Create new job
          console.log("Creating new job");
          const newJob = await addJob(formData);
          
          if (!newJob) {
            throw new Error("Failed to create job");
          }
          
          toast({
            title: "Job Created",
            description: "The job has been successfully created.",
          });
          
          navigate(`/jobs/${newJob.id}`);
          return newJob;
        }
      } catch (error) {
        console.error("Error during form submission:", error);
        throw error;
      }
    },
    [isEditing, job, addJob, updateJob, navigate, toast]
  );

  return { processFormSubmission };
}
