
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useJobs } from "@/contexts/JobContext";
import { Job } from "@/types/job";
import { JobFormValues } from "../JobFormDetails";
import { useToast } from "@/components/ui/use-toast";
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
  
  const { processFormSubmission } = useFormSubmission({ 
    isEditing, 
    job, 
    addJob, 
    updateJob, 
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
