import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useJobs } from "@/contexts/JobContext";
import { Job, Locale, JobStatus, Flavor } from "@/types/job";
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

  const generateMessages = async (formValues: JobFormValues) => {
    setIsGeneratingMessages(true);
    try {
      console.log("Generating messages before form submission...");
      
      if (!formValues.candidateFacingTitle || !formValues.compDesc || !formValues.skillsSought) {
        throw new Error("Missing required fields for message generation");
      }
      
      const firstName = formValues.previewName || "[First Name]";
      const owner = formValues.owner || '';
      
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
        
        setSubmittingState(true);
        
        const completedFormData = await generateMessages(formData);
        
        let result;
        
        if (isEditing && job) {
          const updatedJobData: Job = {
            ...job,
            candidateFacingTitle: completedFormData.candidateFacingTitle,
            compDesc: completedFormData.compDesc,
            locale: typeof completedFormData.locale === 'object' 
              ? completedFormData.locale.name as Locale 
              : job.locale,
            localeId: typeof completedFormData.locale === 'object' 
              ? completedFormData.locale.id 
              : job.localeId,
            flavor: typeof completedFormData.flavor === 'object' 
              ? completedFormData.flavor.name as Flavor 
              : job.flavor,
            flavorId: typeof completedFormData.flavor === 'object' 
              ? completedFormData.flavor.id 
              : job.flavorId,
            status: typeof completedFormData.status === 'object' 
              ? completedFormData.status.name as JobStatus 
              : job.status,
            statusId: typeof completedFormData.status === 'object' 
              ? completedFormData.status.id 
              : job.statusId,
            rate: Number(completedFormData.rate),
            jd: completedFormData.jd || job.jd,
            skillsSought: completedFormData.skillsSought || job.skillsSought,
            minSkills: completedFormData.minSkills || job.minSkills,
            owner: completedFormData.owner || job.owner,
            ownerId: job.ownerId,
            videoQuestions: completedFormData.videoQuestions || job.videoQuestions,
            screeningQuestions: completedFormData.screeningQuestions || job.screeningQuestions,
            workDetails: completedFormData.workDetails || job.workDetails,
            payDetails: completedFormData.payDetails || job.payDetails,
            other: completedFormData.other || job.other,
            m1: completedFormData.m1 || job.m1,
            m2: completedFormData.m2 || job.m2,
            m3: completedFormData.m3 || job.m3,
            client: completedFormData.client || job.client,
            clientId: job.clientId,
            linkedinSearch: job.linkedinSearch,
            lir: job.lir,
            internalTitle: job.internalTitle,
            date: job.date,
            highRate: job.highRate,
            mediumRate: job.mediumRate,
            lowRate: job.lowRate
          };
          
          result = await updateJob(updatedJobData);
          
          if (result) {
            toast({
              title: "Job Updated",
              description: `Job "${result.internalTitle || 'Untitled'}" has been updated successfully.`,
            });
            navigate(`/jobs/${result.id}`);
          }
        } else {
          result = await addJob(completedFormData);
          
          if (result) {
            toast({
              title: "Job Added",
              description: `Job "${result.internalTitle || 'Untitled'}" has been created successfully.`,
            });
            navigate(`/jobs/${result.id}`);
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
