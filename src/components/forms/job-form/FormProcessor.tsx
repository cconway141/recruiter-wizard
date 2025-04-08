import { useNavigate } from "react-router-dom";
import { Job, Locale } from "@/types/job";
import { useJobs } from "@/contexts/JobContext";
import { JobFormValues } from "../JobFormDetails";
import { calculateRates } from "@/utils/rateUtils";
import { generateInternalTitle } from "@/utils/titleUtils";
import { getWorkDetails, getPayDetails } from "@/utils/localeUtils";
import { generateM1, generateM2, generateM3 } from "@/utils/messageUtils";
import { toast } from "@/components/ui/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";

interface FormProcessorProps {
  onSubmit: (values: JobFormValues) => void;
  job?: Job;
  isEditing?: boolean;
}

export function useFormProcessor({ job, isEditing = false }: { job?: Job; isEditing?: boolean }) {
  // Check if useJobs() is returning null
  let jobContext;
  try {
    jobContext = useJobs();
  } catch (error) {
    console.error("Error accessing JobContext:", error);
    // Return a default object to prevent null errors
    return {
      handleSubmit: () => {
        console.error("Job context not available. Cannot submit form.");
        toast({
          title: "Error",
          description: "Unable to access job data. Please refresh the page.",
          variant: "destructive",
        });
      }
    };
  }
  
  const { addJob, updateJob } = jobContext || {};
  const navigate = useNavigate();
  const { loadFromSupabase } = useSupabaseData();
  
  const handleSubmit = async (values: JobFormValues) => {
    try {
      console.log("Form submitted with values:", values);
      
      // Check if we have necessary functions from context
      if (!addJob && !updateJob) {
        throw new Error("Job context functions not available");
      }
      
      const locale = values.locale as Locale;
      const workDetails = await getWorkDetails(locale);
      const payDetails = await getPayDetails(locale);
      
      const { high, medium, low } = calculateRates(values.rate);
      
      // Generate the internal title using the correct format
      const internalTitle = await generateInternalTitle(
        values.client,
        values.candidateFacingTitle,
        values.flavor,
        locale
      );
      
      // Generate message templates
      const m1 = generateM1("[First Name]", values.candidateFacingTitle, values.compDesc);
      const m2 = generateM2(values.candidateFacingTitle, payDetails, workDetails, values.skillsSought);
      const m3 = generateM3(values.videoQuestions);
      
      if (isEditing && job && updateJob) {
        console.log("Updating existing job");
        updateJob({
          ...job,
          ...values,
          locale: locale,
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
        
        // Navigate after successful update
        navigate("/");
      } else if (addJob) {
        console.log("Adding new job with values:", {
          ...values,
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
          // Disable the submit button while processing
          document.querySelector('button[type="submit"]')?.setAttribute('disabled', 'true');
          
          await addJob({
            jd: values.jd,
            candidateFacingTitle: values.candidateFacingTitle,
            status: values.status,
            skillsSought: values.skillsSought,
            minSkills: values.minSkills, 
            lir: values.lir,
            client: values.client,
            compDesc: values.compDesc,
            rate: values.rate,
            locale: locale,
            owner: values.owner,
            date: values.date,
            other: values.other || "",
            videoQuestions: values.videoQuestions,
            screeningQuestions: values.screeningQuestions,
            flavor: values.flavor,
          });
          
          // Show success toast
          toast({
            title: "Job Created",
            description: `${internalTitle} has been added successfully.`,
            variant: "default",
            className: "bg-green-500 text-white border-green-600",
          });
          
          // Refresh data from Supabase before navigating
          await loadFromSupabase();
          
          // Navigate to home page after successful creation
          navigate("/");
        } catch (addError) {
          console.error("Error in addJob:", addError);
          toast({
            title: "Error",
            description: `Failed to create job: ${addError instanceof Error ? addError.message : String(addError)}`,
            variant: "destructive",
          });
          // Re-enable submit button on error
          document.querySelector('button[type="submit"]')?.removeAttribute('disabled');
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
      // Re-enable submit button on error
      document.querySelector('button[type="submit"]')?.removeAttribute('disabled');
      throw err; // Re-throw to prevent navigation
    }
  };

  return { handleSubmit };
}
