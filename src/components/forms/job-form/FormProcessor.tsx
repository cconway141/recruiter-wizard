
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useJobs } from "@/contexts/JobContext";
import { Job, Locale } from "@/types/job";
import { JobFormValues } from "../JobFormDetails";
import { useToast } from "@/components/ui/use-toast";
import { generateM1, generateM2, generateM3 } from "@/utils/messageUtils";
import { getWorkDetails, getPayDetails } from "@/utils/localeUtils";

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

  // Function to generate messages before submission
  const generateMessages = async (formValues: JobFormValues) => {
    setIsGeneratingMessages(true);
    try {
      console.log("Generating messages before form submission...");
      
      // Ensure required values exist
      if (!formValues.candidateFacingTitle || !formValues.compDesc || !formValues.skillsSought) {
        throw new Error("Missing required fields for message generation");
      }
      
      // Generate the messages
      const firstName = formValues.previewName || "[First Name]";
      const owner = formValues.owner || '';
      
      // Generate work and pay details based on locale if not already set
      if (!formValues.workDetails || !formValues.payDetails) {
        const localeName = formValues.locale?.name;
        if (localeName) {
          if (!formValues.workDetails) {
            formValues.workDetails = await getWorkDetails(localeName as Locale);
          }
          if (!formValues.payDetails) {
            formValues.payDetails = await getPayDetails(localeName as Locale);
          }
        }
      }
      
      // Generate all messages in parallel
      const [m1, m2, m3] = await Promise.all([
        generateM1(firstName, formValues.candidateFacingTitle, formValues.compDesc, owner),
        generateM2(
          formValues.candidateFacingTitle, 
          formValues.payDetails || "", 
          formValues.workDetails || "", 
          formValues.skillsSought
        ),
        formValues.videoQuestions ? generateM3(formValues.videoQuestions) : ""
      ]);
      
      // Update the form values with generated messages
      formValues.m1 = m1;
      formValues.m2 = m2;
      formValues.m3 = m3;
      
      console.log("Messages generated successfully");
      return formValues;
    } catch (error) {
      console.error("Error generating messages:", error);
      toast({
        title: "Error generating messages",
        description: "There was a problem generating message templates. You can edit them manually.",
        variant: "destructive",
      });
      return formValues;
    } finally {
      setIsGeneratingMessages(false);
    }
  };

  const processJobForm = useCallback(
    async (formData: JobFormValues) => {
      try {
        console.log(`Processing form data for ${isEditing ? "edit" : "add"} job`);
        
        // Make sure isSubmitting is set to true
        setSubmittingState(true);
        
        // Generate messages before submission
        const completedFormData = await generateMessages(formData);
        
        if (isEditing && job) {
          // Handle job update
          const updatedJob = await updateJob(job.id, completedFormData);
          
          if (updatedJob) {
            toast({
              title: "Job Updated",
              description: `Job "${updatedJob.internalTitle}" has been updated successfully.`,
            });
            navigate(`/jobs/${updatedJob.id}`);
          }
        } else {
          // Handle new job creation
          const newJob = await addJob(completedFormData);
          
          if (newJob) {
            toast({
              title: "Job Added",
              description: `Job "${newJob.internalTitle}" has been created successfully.`,
            });
            navigate(`/jobs/${newJob.id}`);
          }
        }
      } catch (error) {
        console.error("Error processing form:", error);
        toast({
          title: "Error",
          description: `Failed to ${isEditing ? "update" : "add"} job: ${error instanceof Error ? error.message : "Unknown error"}`,
          variant: "destructive",
        });
      } finally {
        setSubmittingState(false);
      }
    },
    [isEditing, job, addJob, updateJob, navigate, toast, setSubmittingState]
  );

  return { processJobForm, isGeneratingMessages };
}
