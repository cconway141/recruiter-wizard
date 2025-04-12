
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useJobs } from "@/contexts/JobContext";
import { Job } from "@/types/job";
import { JobFormValues } from "../JobFormDetails";
import { useToast } from "@/hooks/use-toast";
import { useMessageGenerator } from "./processors/useMessageGenerator";
import { useFormSubmission } from "./processors/useFormSubmission";

interface FormProcessorProps {
  job?: Job;
  isEditing: boolean;
  setSubmittingState: (isSubmitting: boolean) => void;
}

export function useFormProcessor({ job, isEditing, setSubmittingState }: FormProcessorProps) {
  const { addJob, updateJob } = useJobs();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGeneratingMessages, setIsGeneratingMessages] = useState(false);
  
  const { generateMessages } = useMessageGenerator({ 
    setIsGeneratingMessages, 
    toast 
  });
  
  // Create a wrapper function to handle the different updateJob signatures
  const adaptedUpdateJob = useCallback(
    async (jobId: string, formData: any): Promise<Job | null> => {
      if (job) {
        // Create an updated job object that merges the original job with form data
        const updatedJob: Job = {
          ...job,
          ...formData
        };
        
        // Call the actual updateJob function that takes a Job
        await updateJob(updatedJob);
        return updatedJob;
      }
      return null;
    },
    [job, updateJob]
  );
  
  const { processFormSubmission } = useFormSubmission({ 
    isEditing, 
    job, 
    addJob, 
    updateJob: adaptedUpdateJob, 
    navigate, 
    toast 
  });

  const processJobForm = useCallback(
    async (formData: JobFormValues): Promise<Job> => {
      try {
        console.log(`Processing form data for ${isEditing ? "edit" : "add"} job:`, formData);
        setSubmittingState(true);
        
        // Step 1: Generate messages
        const completedFormData = await generateMessages(formData);
        console.log("Form data after message generation:", completedFormData);
        
        // Step 2: Process the form submission
        const result = await processFormSubmission(completedFormData);
        return result; // Return the Job object from processFormSubmission
      } catch (error) {
        console.error("Error processing form:", error);
        toast({
          title: "Error",
          description: `Failed to ${isEditing ? "update" : "add"} job: ${error instanceof Error ? error.message : "Unknown error"}`,
          variant: "destructive",
        });
        throw error; // Re-throw to allow caller to handle it
      } finally {
        setSubmittingState(false);
      }
    },
    [isEditing, job, setSubmittingState, generateMessages, processFormSubmission, toast]
  );

  return { processJobForm, isGeneratingMessages };
}
