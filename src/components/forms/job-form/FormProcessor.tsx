
import { useNavigate } from "react-router-dom";
import { Job, Locale } from "@/types/job";
import { useJobs } from "@/contexts/JobContext";
import { JobFormValues } from "../JobFormDetails";
import { 
  calculateRates, 
  generateInternalTitle, 
  getWorkDetails, 
  getPayDetails,
  generateM1,
  generateM2,
  generateM3
} from "@/utils/jobUtils";
import { toast } from "@/components/ui/use-toast";

interface FormProcessorProps {
  onSubmit: (values: JobFormValues) => void;
  job?: Job;
  isEditing?: boolean;
}

export function useFormProcessor({ job, isEditing = false }: { job?: Job; isEditing?: boolean }) {
  const { addJob, updateJob } = useJobs();
  const navigate = useNavigate();
  
  const handleSubmit = async (values: JobFormValues) => {
    try {
      console.log("Form submitted with values:", values);
      
      const locale = values.locale as Locale;
      const workDetails = await getWorkDetails(locale);
      const payDetails = await getPayDetails(locale);
      
      const { high, medium, low } = calculateRates(values.rate);
      
      const internalTitle = generateInternalTitle(
        values.client,
        values.candidateFacingTitle,
        values.flavor,
        locale
      );
      
      // Generate message templates
      const m1 = generateM1("[First Name]", values.candidateFacingTitle, values.compDesc);
      const m2 = generateM2(values.candidateFacingTitle, payDetails, workDetails, values.skillsSought);
      const m3 = generateM3(values.videoQuestions);
      
      if (isEditing && job) {
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
      } else {
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
