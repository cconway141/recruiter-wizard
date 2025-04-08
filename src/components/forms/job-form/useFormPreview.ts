
import { useState, useEffect } from "react";
import { Locale } from "@/types/job";
import { UseFormReturn } from "react-hook-form";
import { JobFormValues } from "../JobFormDetails"; 
import {
  generateInternalTitle,
  getWorkDetails,
  getPayDetails,
  generateM1,
  generateM2,
  generateM3
} from "@/utils/jobUtils";

export function useFormPreview(form: UseFormReturn<JobFormValues>) {
  const [previewTitle, setPreviewTitle] = useState("");
  const [messages, setMessages] = useState({
    m1: "",
    m2: "",
    m3: "",
  });
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const watchedFields = form.watch();

  useEffect(() => {
    // Generate internal title preview when relevant fields change
    if (watchedFields.client && watchedFields.candidateFacingTitle && watchedFields.flavor && watchedFields.locale) {
      try {
        const newTitle = generateInternalTitle(
          watchedFields.client,
          watchedFields.candidateFacingTitle,
          watchedFields.flavor,
          watchedFields.locale as Locale
        );
        setPreviewTitle(newTitle);
      } catch (err) {
        console.error("Error generating internal title:", err);
      }
    }

    // Generate message previews when relevant fields change
    const generateMessages = async () => {
      if (watchedFields.candidateFacingTitle && watchedFields.locale && watchedFields.skillsSought && watchedFields.videoQuestions) {
        try {
          setIsLoadingMessages(true);
          const locale = watchedFields.locale as Locale;
          
          // Fetch work and pay details from the database based on locale
          const workDetails = await getWorkDetails(locale);
          const payDetails = await getPayDetails(locale);
          
          // Update the form with the fetched details
          form.setValue("workDetails", workDetails);
          form.setValue("payDetails", payDetails);
          
          // Generate messages using the fetched details and form values
          const m1 = generateM1("[First Name]", watchedFields.candidateFacingTitle, watchedFields.compDesc);
          const m2 = generateM2(watchedFields.candidateFacingTitle, payDetails, workDetails, watchedFields.skillsSought);
          const m3 = generateM3(watchedFields.videoQuestions);
          
          setMessages({ m1, m2, m3 });
        } catch (err) {
          console.error("Error generating messages:", err);
        } finally {
          setIsLoadingMessages(false);
        }
      }
    };

    generateMessages();
  }, [watchedFields, form]);

  return { 
    previewTitle, 
    messages, 
    isLoadingMessages, 
    watchedFields 
  };
}
