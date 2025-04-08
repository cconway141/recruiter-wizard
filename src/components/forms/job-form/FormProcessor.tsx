
import { useNavigate } from "react-router-dom";
import { Job, Locale } from "@/types/job";
import { useJobs } from "@/contexts/JobContext";
import { JobFormValues } from "../JobFormDetails";
import { 
  calculateRates, 
  generateInternalTitle, 
  getWorkDetails, 
  getPayDetails
} from "@/utils/jobUtils";

interface FormProcessorProps {
  onSubmit: (values: JobFormValues) => void;
  job?: Job;
  isEditing?: boolean;
  messages: {
    m1: string;
    m2: string;
    m3: string;
  };
}

export function useFormProcessor({ job, isEditing = false }: { job?: Job; isEditing?: boolean }) {
  const { addJob, updateJob } = useJobs();
  const navigate = useNavigate();
  
  const handleSubmit = async (values: JobFormValues) => {
    try {
      const { previewName, ...jobData } = values;
      
      const { high, medium, low } = calculateRates(values.rate);
      
      const locale = values.locale as Locale;
      const workDetails = await getWorkDetails(locale);
      const payDetails = await getPayDetails(locale);
      
      const internalTitle = generateInternalTitle(
        values.client,
        values.candidateFacingTitle,
        values.flavor,
        locale
      );
      
      if (isEditing && job) {
        updateJob({
          ...job,
          ...jobData,
          locale: jobData.locale as Locale,
          status: jobData.status,
          flavor: jobData.flavor,
          internalTitle,
          highRate: high,
          mediumRate: medium,
          lowRate: low,
          workDetails,
          payDetails,
          m1: values.m1,
          m2: values.m2,
          m3: values.m3
        });
      } else {
        addJob({
          jd: jobData.jd,
          candidateFacingTitle: jobData.candidateFacingTitle,
          status: jobData.status,
          skillsSought: jobData.skillsSought,
          minSkills: jobData.minSkills, 
          lir: jobData.lir,
          client: jobData.client,
          compDesc: jobData.compDesc,
          rate: jobData.rate,
          locale: jobData.locale as Locale,
          owner: jobData.owner,
          date: jobData.date,
          other: jobData.other || "",
          videoQuestions: jobData.videoQuestions,
          screeningQuestions: jobData.screeningQuestions,
          flavor: jobData.flavor,
        });
      }
      
      navigate("/");
    } catch (err) {
      console.error("Error in form submission:", err);
    }
  };

  return { handleSubmit };
}
