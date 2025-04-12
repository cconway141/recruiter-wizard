import { useNavigate } from "react-router-dom";
import { Job, Locale } from "@/types/job";
import { useJobs } from "@/contexts/JobContext";
import { JobFormValues } from "../JobFormDetails";
import { calculateRates } from "@/utils/rateUtils";
import { generateInternalTitle } from "@/utils/titleUtils";
import { getWorkDetails, getPayDetails } from "@/utils/localeUtils";
import { generateM1, generateM2, generateM3 } from "@/utils/messageUtils";
import { toast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useState } from "react";

interface FormProcessorProps {
  onSubmit: (values: JobFormValues) => void;
  job?: Job;
  isEditing?: boolean;
}

export function useFormProcessor({ job, isEditing = false }: { job?: Job; isEditing?: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  let jobContext;
  
  try {
    jobContext = useJobs();
  } catch (error) {
    console.error("Error accessing JobContext:", error);
    return {
      handleSubmit: () => {
        console.error("Job context not available. Cannot submit form.");
        toast({
          title: "Error",
          description: "Unable to access job data. Please refresh the page.",
          variant: "destructive",
        });
      },
      isSubmitting
    };
  }
  
  const { addJob, updateJob } = jobContext || {};
  const navigate = useNavigate();
  const { loadFromSupabase } = useSupabaseData();
  
  const validateRequiredFields = (values: JobFormValues): boolean => {
    const requiredFields = [
      { name: 'candidateFacingTitle', label: 'Job Title' },
      { name: 'client', label: 'Client' },
      { name: 'rate', label: 'Rate' },
      { name: 'jd', label: 'Job Description' },
      { name: 'compDesc', label: 'Company Description' },
      { name: 'skillsSought', label: 'Skills Sought' },
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = values[field.name as keyof JobFormValues];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(f => f.label).join(', ');
      toast({
        title: "Missing Required Fields",
        description: `Please fill in the following required fields: ${fieldNames}`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (values: JobFormValues) => {
    try {
      console.log("Form submission started with values:", values);
      
      // Validate required fields
      if (!validateRequiredFields(values)) {
        console.log("Form validation failed - missing required fields");
        return;
      }

      // Type guard for locale validation
      const isValidLocale = (locale: string): locale is Locale =>
        ["Onshore", "Nearshore", "Offshore"].includes(locale);

      const rawLocale = typeof values.locale === 'object' 
        ? (values.locale as { name: string }).name 
        : values.locale;

      if (!rawLocale || typeof rawLocale !== "string" || !isValidLocale(rawLocale)) {
        console.error("Invalid locale value:", rawLocale);
        toast({
          title: "Validation Error",
          description: "Invalid locale selected. Please choose a valid locale.",
          variant: "destructive",
        });
        return;
      }

      const localeName = rawLocale as Locale;
      const workDetails = await getWorkDetails(localeName);
      const payDetails = await getPayDetails(localeName);
      
      const { high, medium, low } = calculateRates(values.rate);
      
      const internalTitle = await generateInternalTitle(
        values.client,
        values.candidateFacingTitle,
        typeof values.flavor === 'object' ? values.flavor.name || '' : values.flavor,
        localeName
      );
      
      console.log("Generated internal title:", internalTitle);
      
      const m1 = generateM1("[First Name]", values.candidateFacingTitle, values.compDesc);
      const m2 = generateM2(values.candidateFacingTitle, payDetails, workDetails, values.skillsSought);
      const m3 = generateM3(values.videoQuestions);
      
      if (isEditing && job && updateJob) {
        console.log("Updating existing job");
        updateJob({
          ...job,
          ...values,
          localeId: typeof values.locale === 'object' ? values.locale.id : undefined,
          flavorId: typeof values.flavor === 'object' ? values.flavor.id : undefined,
          locale: localeName,
          flavor: typeof values.flavor === 'object' ? values.flavor.name : values.flavor,
          status: typeof values.status === 'object' ? values.status.name : values.status,
          internalTitle,
          highRate: high,
          mediumRate: medium,
          lowRate: low,
          workDetails,
          payDetails,
          m1,
          m2,
          m3
        });
        
        toast({
          title: "Job Updated",
          description: `${internalTitle} has been updated successfully.`,
        });
        
        navigate("/");
      } else if (addJob) {
        console.log("Adding new job with values:", {
          ...values,
          localeId: typeof values.locale === 'object' ? values.locale.id : undefined,
          flavorId: typeof values.flavor === 'object' ? values.flavor.id : undefined,
          status: typeof values.status === 'object' ? values.status.name : values.status,
          internalTitle,
          highRate: high,
          mediumRate: medium,
          lowRate: low,
          workDetails,
          payDetails,
          m1,
          m2,
          m3
        });
        
        try {
          const result = await addJob({
            jd: values.jd,
            candidateFacingTitle: values.candidateFacingTitle,
            status: typeof values.status === 'object' ? values.status.name : values.status,
            skillsSought: values.skillsSought,
            minSkills: values.minSkills, 
            lir: values.lir,
            client: values.client,
            compDesc: values.compDesc,
            rate: values.rate,
            localeId: typeof values.locale === 'object' ? values.locale.id : undefined,
            flavorId: typeof values.flavor === 'object' ? values.flavor.id : undefined,
            locale: localeName,
            flavor: typeof values.flavor === 'object' ? values.flavor.name : values.flavor,
            owner: values.owner,
            date: values.date,
            other: values.other || "",
            videoQuestions: values.videoQuestions,
            screeningQuestions: values.screeningQuestions,
          });
          
          if (result) {
            toast({
              title: "Job Created",
              description: `${internalTitle} has been added successfully.`,
              variant: "default",
              className: "bg-green-500 text-white border-green-600",
            });
            
            await loadFromSupabase();
            
            navigate("/");
          } else {
            throw new Error("Failed to create job - no result returned");
          }
        } catch (addError) {
          console.error("Error in addJob:", addError);
          toast({
            title: "Error",
            description: `Failed to create job: ${addError instanceof Error ? addError.message : String(addError)}`,
            variant: "destructive",
          });
        }
      } else {
        throw new Error("addJob function is not available");
      }
    } catch (err) {
      console.error("Error in form submission:", err);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} job: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      document.querySelector('button[type="submit"]')?.removeAttribute('disabled');
    }
  };

  return { handleSubmit, isSubmitting };
}
