
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
        const localeName = typeof formValues.locale === 'object' ? formValues.locale.name : formValues.locale;
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
        console.log(`Processing form data for ${isEditing ? "edit" : "add"} job:`, formData);
        
        setSubmittingState(true);
        
        const completedFormData = await generateMessages(formData);
        console.log("Form data after message generation:", completedFormData);
        
        if (isEditing && job) {
          // Handle updating existing job
          const updatedJobData: Job = {
            ...job,
            candidateFacingTitle: completedFormData.candidateFacingTitle,
            compDesc: completedFormData.compDesc,
            locale: typeof completedFormData.locale === 'object' 
              ? completedFormData.locale.name as Locale 
              : (completedFormData.locale as Locale || job.locale),
            localeId: typeof completedFormData.locale === 'object' 
              ? completedFormData.locale.id 
              : job.localeId,
            flavor: typeof completedFormData.flavor === 'object' 
              ? completedFormData.flavor.name as Flavor 
              : (completedFormData.flavor as Flavor || job.flavor),
            flavorId: typeof completedFormData.flavor === 'object' 
              ? completedFormData.flavor.id 
              : job.flavorId,
            status: typeof completedFormData.status === 'object' 
              ? completedFormData.status.name as JobStatus 
              : (completedFormData.status as JobStatus || job.status),
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
          
          console.log("Calling updateJob with data:", updatedJobData);
          const result = await updateJob(updatedJobData);
          
          if (result) {
            toast({
              title: "Job Updated",
              description: `Job "${result.internalTitle || 'Untitled'}" has been updated successfully.`,
            });
            navigate(`/jobs/${result.id}`);
          }
        } else {
          // Handle creating new job
          // Convert form data to the structure expected by addJob
          const newJobData = {
            candidateFacingTitle: completedFormData.candidateFacingTitle,
            compDesc: completedFormData.compDesc,
            locale: typeof completedFormData.locale === 'object' ? completedFormData.locale.name as Locale : completedFormData.locale as Locale,
            localeId: typeof completedFormData.locale === 'object' ? completedFormData.locale.id : "",
            flavor: typeof completedFormData.flavor === 'object' ? completedFormData.flavor.name as Flavor : completedFormData.flavor as Flavor,
            flavorId: typeof completedFormData.flavor === 'object' ? completedFormData.flavor.id : "",
            status: typeof completedFormData.status === 'object' ? completedFormData.status.name as JobStatus : completedFormData.status as JobStatus,
            statusId: typeof completedFormData.status === 'object' ? completedFormData.status.id : "",
            jd: completedFormData.jd || "",
            skillsSought: completedFormData.skillsSought || "",
            minSkills: completedFormData.minSkills || "",
            owner: completedFormData.owner || "",
            ownerId: "",
            rate: Number(completedFormData.rate) || 0,
            videoQuestions: completedFormData.videoQuestions || "",
            screeningQuestions: completedFormData.screeningQuestions || "",
            workDetails: completedFormData.workDetails || "",
            payDetails: completedFormData.payDetails || "",
            other: completedFormData.other || "",
            client: completedFormData.client || "",
            clientId: "",
            m1: completedFormData.m1 || "",
            m2: completedFormData.m2 || "",
            m3: completedFormData.m3 || "",
            lir: completedFormData.lir || "",
            date: new Date().toISOString().split("T")[0],
            linkedinSearch: ""
          };
          
          console.log("Calling addJob with data:", newJobData);
          const result = await addJob(newJobData);
          
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
