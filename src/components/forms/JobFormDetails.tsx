
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Locale } from "@/types/job";
import { getWorkDetails, getPayDetails, generateM1, generateM2, generateM3 } from "@/utils/jobUtils";

// Import the new components
import { JobFormDescription } from "./job-details/JobFormDescription";
import { JobFormWorkDetails } from "./job-details/JobFormWorkDetails";
import { JobFormQuestionDetails } from "./job-details/JobFormQuestionDetails";
import { JobFormOtherInfo } from "./job-details/JobFormOtherInfo";
import { MessageTabs } from "./job-details/MessageTabs";

export interface JobFormValues {
  candidateFacingTitle: string;
  compDesc: string;
  locale: string;
  skillsSought: string;
  videoQuestions: string;
  workDetails: string;
  payDetails: string;
  jd: string;
  minSkills: string;
  other: string;
  screeningQuestions: string;
  m1: string;
  m2: string;
  m3: string;
  [key: string]: any;
}

interface JobFormDetailsProps {
  form: UseFormReturn<JobFormValues>;
}

export function JobFormDetails({ form }: JobFormDetailsProps) {
  const [messages, setMessages] = useState({
    m1: "",
    m2: "",
    m3: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedUpdate, setDebouncedUpdate] = useState(false);

  const watchedFields = {
    candidateFacingTitle: form.watch("candidateFacingTitle"),
    compDesc: form.watch("compDesc"),
    locale: form.watch("locale"),
    skillsSought: form.watch("skillsSought"),
    videoQuestions: form.watch("videoQuestions")
  };

  // Add a debounce to prevent too frequent updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUpdate(true);
    }, 1000); // Wait 1 second after typing stops

    return () => {
      clearTimeout(timer);
      setDebouncedUpdate(false);
    };
  }, [watchedFields]);

  useEffect(() => {
    const updateMessages = async () => {
      // Only update messages if all required fields are filled and the debounce timer has completed
      if (debouncedUpdate && 
          watchedFields.candidateFacingTitle && 
          watchedFields.compDesc && 
          watchedFields.locale && 
          watchedFields.skillsSought) {
        try {
          setIsLoading(true);
          const locale = watchedFields.locale as Locale;
          const workDetails = await getWorkDetails(locale);
          const payDetails = await getPayDetails(locale);
          
          // Update the form values with the fetched details
          form.setValue("workDetails", workDetails);
          form.setValue("payDetails", payDetails);
          
          const m1 = generateM1("[First Name]", watchedFields.candidateFacingTitle, watchedFields.compDesc);
          const m2 = generateM2(watchedFields.candidateFacingTitle, payDetails, workDetails, watchedFields.skillsSought);
          
          // Only generate m3 if videoQuestions has content
          let m3 = messages.m3;
          if (watchedFields.videoQuestions) {
            m3 = generateM3(watchedFields.videoQuestions);
          }
          
          setMessages({ m1, m2, m3 });
          
          // Update the form values with the generated messages
          form.setValue("m1", m1);
          form.setValue("m2", m2);
          form.setValue("m3", m3);
        } catch (err) {
          console.error("Error generating messages:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    updateMessages();
  }, [debouncedUpdate, form]);

  return (
    <div className="space-y-6">
      <JobFormDescription />
      <JobFormWorkDetails />
      <JobFormQuestionDetails />
      <JobFormOtherInfo />
      <MessageTabs form={form} messages={messages} isLoading={isLoading} />
    </div>
  );
}
