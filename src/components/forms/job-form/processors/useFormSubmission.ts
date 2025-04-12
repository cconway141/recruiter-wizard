
import { useCallback } from "react";
import { NavigateFunction } from "react-router-dom";
import { Job, JobStatus, Locale, Flavor } from "@/types/job";
import { JobFormValues } from "../../JobFormDetails";

interface FormSubmissionProps {
  isEditing: boolean;
  job?: Job;
  addJob: (job: any) => Promise<Job | null>;
  updateJob: (job: Job) => Promise<Job | null>;
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
  
  const processFormSubmission = useCallback(async (completedFormData: JobFormValues) => {
    console.log(`Processing ${isEditing ? "update" : "creation"} with data:`, completedFormData);
    
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
      await updateJob(updatedJobData);
      
      // Success handling after update
      toast({
        title: "Job Updated",
        description: `Job "${updatedJobData.internalTitle || 'Untitled'}" has been updated successfully.`,
      });
      navigate(`/jobs/${updatedJobData.id}`);
      
    } else {
      // Handle creating new job
      // Convert form data to the structure expected by addJob
      const newJobData = {
        candidateFacingTitle: completedFormData.candidateFacingTitle,
        compDesc: completedFormData.compDesc,
        locale: typeof completedFormData.locale === 'object' 
          ? completedFormData.locale.name as Locale 
          : completedFormData.locale as Locale,
        localeId: typeof completedFormData.locale === 'object' 
          ? completedFormData.locale.id 
          : "",
        flavor: typeof completedFormData.flavor === 'object' 
          ? completedFormData.flavor.name as Flavor 
          : completedFormData.flavor as Flavor,
        flavorId: typeof completedFormData.flavor === 'object' 
          ? completedFormData.flavor.id 
          : "",
        status: typeof completedFormData.status === 'object' 
          ? completedFormData.status.name as JobStatus 
          : completedFormData.status as JobStatus,
        statusId: typeof completedFormData.status === 'object' 
          ? completedFormData.status.id 
          : "",
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
      console.log("Result from addJob:", result);
      
      if (result) {
        toast({
          title: "Job Added",
          description: `Job "${result.internalTitle || 'Untitled'}" has been created successfully.`,
        });
        navigate(`/jobs/${result.id}`);
      } else {
        // Handle case where addJob returns null (error occurred)
        toast({
          title: "Error",
          description: "Failed to add job. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [isEditing, job, addJob, updateJob, navigate, toast]);

  return { processFormSubmission };
}
